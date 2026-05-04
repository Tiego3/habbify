from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Habit, HabitLog
from .serializers import HabitSerializer, HabitLogSerializer, HabitStatsSerializer


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Habit.objects.filter(user=self.request.user)
        archived = self.request.query_params.get('archived')
        if archived == 'true':
            qs = qs.filter(is_archived=True)
        elif archived != 'all':
            qs = qs.filter(is_archived=False)
        return qs.prefetch_related('logs')

    @action(detail=True, methods=['post'])
    def log(self, request, pk=None):
        habit = self.get_object()
        serializer = HabitLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        log_date = serializer.validated_data['date']
        log, created = HabitLog.objects.update_or_create(
            habit=habit,
            date=log_date,
            defaults={
                'completed': serializer.validated_data['completed'],
                'note': serializer.validated_data.get('note', ''),
            }
        )
        cache.delete(f'calendar_{request.user.id}_{log_date.strftime("%Y-%m")}')
        return Response(HabitLogSerializer(log).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        habit = self.get_object()
        data = {
            'current_streak': habit.get_current_streak(),
            'longest_streak': habit.get_longest_streak(),
            'completion_rate': habit.get_completion_rate(),
            'heatmap_data': habit.get_heatmap_data(),
        }
        serializer = HabitStatsSerializer(data)
        return Response(serializer.data)
