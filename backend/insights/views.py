import calendar as cal_module
from datetime import date, timedelta
from collections import Counter, defaultdict
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from habits.models import Habit, HabitLog
from tasks.models import Task


def _period_bounds(timeframe):
    today = date.today()
    if timeframe == 'week':
        start = today - timedelta(days=6)
    elif timeframe == 'month':
        start = today - timedelta(days=29)
    else:
        start = today - timedelta(days=364)
    return start, today


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def insights(request):
    timeframe = request.query_params.get('timeframe', 'week')
    start, today = _period_bounds(timeframe)
    user = request.user
    days = (today - start).days + 1

    # Habit consistency score
    habits = Habit.objects.filter(user=user, is_archived=False).prefetch_related('logs')
    scheduled_total = 0
    completed_total = 0
    for h in habits:
        for i in range(days):
            d = start + timedelta(days=i)
            if h._is_scheduled(d):
                scheduled_total += 1
        completed_total += h.logs.filter(
            date__gte=start, date__lte=today, completed=True
        ).count()
    habit_consistency = round((completed_total / scheduled_total) * 100) if scheduled_total else 0

    # Task completion rate
    created_tasks = Task.objects.filter(
        user=user, created_at__date__gte=start, deleted_at__isnull=True
    )
    completed_tasks = created_tasks.filter(is_complete=True)
    task_rate = round((completed_tasks.count() / created_tasks.count()) * 100) if created_tasks.count() else 0

    # Top streak habit
    top_habit = None
    top_streak = 0
    for h in habits:
        streak = h.get_current_streak()
        if streak > top_streak:
            top_streak = streak
            top_habit = h.name

    # Most/least productive day (task completions by weekday)
    completions = Task.objects.filter(
        user=user, completed_at__date__gte=start, is_complete=True
    )
    day_completions = Counter(t.completed_at.strftime('%A') for t in completions if t.completed_at)
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    sorted_days = sorted(day_order, key=lambda d: day_completions.get(d, 0))
    most_productive = sorted_days[-1] if sorted_days else 'Monday'
    least_productive = sorted_days[0] if sorted_days else 'Sunday'

    # Daily task completions for line chart
    daily_completions = defaultdict(int)
    for t in completions:
        if t.completed_at:
            daily_completions[t.completed_at.date().isoformat()] += 1
    line_chart = [
        {'date': (start + timedelta(days=i)).isoformat(),
         'count': daily_completions.get((start + timedelta(days=i)).isoformat(), 0)}
        for i in range(days)
    ]

    # Habit completions by day of week for bar chart
    habit_logs = HabitLog.objects.filter(
        habit__user=user, date__gte=start, completed=True
    )
    habit_by_day = defaultdict(int)
    for log in habit_logs:
        habit_by_day[log.date.strftime('%A')] += 1
    bar_chart = [{'day': d, 'count': habit_by_day.get(d, 0)} for d in day_order]

    # Pattern cards
    patterns = []
    best_count = day_completions.get(most_productive, 0)
    avg_count = sum(day_completions.values()) / 7 if day_completions else 0
    if best_count > 0 and avg_count > 0:
        pct = round(((best_count - avg_count) / avg_count) * 100)
        if pct > 10:
            patterns.append(f"You complete {pct}% more tasks on {most_productive}s than average.")
    if top_habit and top_streak > 0:
        patterns.append(f"Your {top_habit} streak is {top_streak} days — keep it going!")
    if habit_consistency >= 80:
        patterns.append(f"Outstanding week — {habit_consistency}% habit consistency!")

    return Response({
        'habit_consistency': habit_consistency,
        'task_completion_rate': task_rate,
        'top_streak_habit': top_habit,
        'top_streak': top_streak,
        'most_productive_day': most_productive,
        'least_productive_day': least_productive,
        'line_chart': line_chart,
        'bar_chart': bar_chart,
        'patterns': patterns,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_view(request):
    month_str = request.query_params.get('month')
    if not month_str:
        month_str = date.today().strftime('%Y-%m')

    try:
        year, month = map(int, month_str.split('-'))
        if not (1 <= month <= 12):
            raise ValueError
    except (ValueError, AttributeError):
        return Response({'error': 'Invalid month format. Use YYYY-MM.'}, status=400)

    cache_key = f'calendar_{request.user.id}_{month_str}'
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)

    first_day = date(year, month, 1)
    last_day = date(year, month, cal_module.monthrange(year, month)[1])
    num_days = (last_day - first_day).days + 1
    user = request.user

    # Tasks grouped by due_date
    tasks = Task.objects.filter(
        user=user,
        due_date__gte=first_day,
        due_date__lte=last_day,
        deleted_at__isnull=True,
    )
    tasks_by_date = defaultdict(list)
    for task in tasks:
        tasks_by_date[task.due_date.isoformat()].append({
            'id': task.id,
            'title': task.title,
            'priority': task.priority,
            'estimated_minutes': task.estimated_minutes,
            'is_complete': task.is_complete,
        })

    # Habits scheduled per day with completion status
    habits = list(Habit.objects.filter(user=user, is_archived=False))
    habit_log_map = {}
    if habits:
        for log in HabitLog.objects.filter(
            habit__in=habits, date__gte=first_day, date__lte=last_day
        ):
            habit_log_map[(log.habit_id, log.date)] = log.completed

    habits_by_date = defaultdict(list)
    for i in range(num_days):
        d = first_day + timedelta(days=i)
        for habit in habits:
            if habit._is_scheduled(d):
                habits_by_date[d.isoformat()].append({
                    'id': habit.id,
                    'name': habit.name,
                    'color': habit.color,
                    'scheduled': True,
                    'completed': habit_log_map.get((habit.id, d), False),
                })

    result = {
        'month': month_str,
        'tasks': [
            {'date': d, 'items': items}
            for d, items in sorted(tasks_by_date.items())
        ],
        'habits': [
            {'date': d, 'items': items}
            for d, items in sorted(habits_by_date.items())
        ],
    }

    cache.set(cache_key, result, 60)
    return Response(result)
