import json
from datetime import date
from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def _build_system_prompt(user):
    from habits.models import Habit
    from tasks.models import Task

    today = date.today()
    habits = Habit.objects.filter(user=user, is_archived=False).prefetch_related('logs')
    tasks = Task.objects.filter(user=user, is_complete=False, deleted_at__isnull=True)

    habit_summary = ', '.join(h.name for h in habits) or 'none'
    streak_data = ', '.join(
        f"{h.name}: {h.get_current_streak()} days" for h in habits
    ) or 'no streaks'

    task_count = tasks.count()
    overdue_count = sum(1 for t in tasks if t.is_overdue())

    # Best/worst day based on 90-day habit logs
    from habits.models import HabitLog
    from collections import Counter
    from datetime import timedelta

    start = today - timedelta(days=90)
    logs = HabitLog.objects.filter(
        habit__user=user, date__gte=start, completed=True
    )
    day_counts = Counter(log.date.strftime('%A') for log in logs)
    days_ordered = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_counts_sorted = sorted(days_ordered, key=lambda d: day_counts.get(d, 0))
    best_day = day_counts_sorted[-1] if day_counts_sorted else 'unknown'
    worst_day = day_counts_sorted[0] if day_counts_sorted else 'unknown'

    return f"""You are a calm, non-judgmental habit and productivity coach.
You speak like a thoughtful friend, not a corporate chatbot.
Keep responses concise — under 120 words unless the user asks for detail.
Never use guilt-inducing language. Use encouraging, supportive language.
Never say things like "you broke your streak" — instead say "keep it going" or "back on track".

User context (current as of {today}):
- Active habits: {habit_summary}
- Habit streaks: {streak_data}
- Incomplete tasks: {task_count} tasks, {overdue_count} overdue
- Most consistent day: {best_day}
- Least consistent day: {worst_day}"""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    try:
        import anthropic
    except ImportError:
        return Response({'error': 'Anthropic SDK not installed'}, status=503)

    api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
    if not api_key:
        return Response({'error': 'ANTHROPIC_API_KEY not configured'}, status=503)

    messages = request.data.get('messages', [])
    include_context = request.data.get('include_context', True)

    system_prompt = _build_system_prompt(request.user) if include_context else (
        "You are a calm, supportive productivity coach."
    )

    client = anthropic.Anthropic(api_key=api_key)
    stream = request.data.get('stream', True)

    if stream:
        def event_stream():
            with client.messages.stream(
                model='claude-sonnet-4-20250514',
                max_tokens=512,
                system=system_prompt,
                messages=messages,
            ) as s:
                for text in s.text_stream:
                    yield f"data: {json.dumps({'text': text})}\n\n"
            yield "data: [DONE]\n\n"

        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
    else:
        message = client.messages.create(
            model='claude-sonnet-4-20250514',
            max_tokens=512,
            system=system_prompt,
            messages=messages,
        )
        return Response({'content': message.content[0].text})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def insight(request):
    """Returns a one-liner AI insight for the dashboard chip."""
    try:
        import anthropic
    except ImportError:
        return Response({'insight': 'Keep building your habits one day at a time.'})

    api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
    if not api_key:
        return Response({'insight': 'Keep building your habits one day at a time.'})

    system = _build_system_prompt(request.user)
    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=60,
        system=system,
        messages=[{
            'role': 'user',
            'content': (
                'Give me one short encouraging observation about my habits or tasks. '
                'One sentence only, under 20 words, no emoji.'
            )
        }],
    )
    return Response({'insight': message.content[0].text})
