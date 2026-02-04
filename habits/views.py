from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from datetime import date, timedelta

from .models import Habit, Progress
from .forms import HabitForm

# -----------------------------
# Dashboard
# -----------------------------
class DashboardView(LoginRequiredMixin, ListView):
    model = Habit
    template_name = 'habits/dashboard.html'
    context_object_name = 'habits'

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).order_by('-created_at')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        habits = ctx['habits']
        # summary
        completed_today = sum(1 for h in habits if h.completed_today())
        ctx.update({
            'completed_today': completed_today,
            'total_habits': habits.count(),
        })
        return ctx

# -----------------------------
# Habit CRUD Views
# -----------------------------
class HabitCreateView(LoginRequiredMixin, CreateView):
    model = Habit
    form_class = HabitForm
    template_name = 'habits/habit_form.html'
    success_url = reverse_lazy('dashboard')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

class HabitUpdateView(LoginRequiredMixin, UpdateView):
    model = Habit
    form_class = HabitForm
    template_name = 'habits/habit_form.html'
    success_url = reverse_lazy('dashboard')

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

class HabitDeleteView(LoginRequiredMixin, DeleteView):
    model = Habit
    template_name = 'habits/habit_confirm_delete.html'
    success_url = reverse_lazy('dashboard')

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

# -----------------------------
# AJAX Toggle Progress
# -----------------------------
@login_required
def toggle_progress(request, pk):
    habit = get_object_or_404(Habit, pk=pk, user=request.user)
    today = date.today()
    progress, created = Progress.objects.get_or_create(habit=habit, date=today, defaults={'completed': True})
    if not created:
        progress.completed = not progress.completed
        progress.save()

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'completed': progress.completed, 'streak': habit.current_streak(), 'count': habit.completion_count()})
    return redirect('dashboard')

# -----------------------------
# Habit History
# -----------------------------
@login_required
def history_view(request, pk):
    habit = get_object_or_404(Habit, pk=pk, user=request.user)
    today = date.today()
    days = [today - timedelta(days=i) for i in range(29, -1, -1)]
    completions = {p.date: p.completed for p in habit.progress.filter(date__range=[days[0], days[-1]])}
    series = [{'date': d.isoformat(), 'completed': completions.get(d, False)} for d in days]
    return render(request, 'habits/history.html', {'habit': habit, 'series': series})

# -----------------------------
# Habit Chart Data (Chart.js)
# -----------------------------
@login_required
def habit_chart_data(request, pk):
    habit = get_object_or_404(Habit, pk=pk, user=request.user)
    today = date.today()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    labels = [d.strftime('%a %d') for d in days]
    data = [1 if habit.progress.filter(date=d, completed=True).exists() else 0 for d in days]
    return JsonResponse({'labels': labels, 'data': data, 'name': habit.name})
