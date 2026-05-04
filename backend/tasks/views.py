from datetime import date
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Task, Tag
from .serializers import TaskSerializer, TagSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user, deleted_at__isnull=True)

        tab = self.request.query_params.get('tab')
        if tab == 'active':
            qs = qs.filter(is_complete=False)
        elif tab == 'completed':
            qs = qs.filter(is_complete=True)
        elif tab == 'attention':
            today = date.today()
            qs = qs.filter(is_complete=False).filter(
                Q(due_date__lt=today) | Q(priority='high')
            )

        priority = self.request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)

        tag = self.request.query_params.get('tag')
        if tag:
            qs = qs.filter(tags__id=tag)

        sort = self.request.query_params.get('sort', 'due_date')
        sort_map = {
            'priority': 'priority',
            'due_date': 'due_date',
            'created': 'created_at',
        }
        qs = qs.order_by(sort_map.get(sort, 'due_date'), 'created_at')

        return qs.prefetch_related('tags')

    def _invalidate_calendar(self, task):
        if task.due_date:
            cache.delete(f'calendar_{task.user_id}_{task.due_date.strftime("%Y-%m")}')

    def perform_create(self, serializer):
        task = serializer.save()
        self._invalidate_calendar(task)

    def perform_update(self, serializer):
        task = serializer.save()
        self._invalidate_calendar(task)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.is_complete = True
        task.completed_at = timezone.now()
        task.save()
        return Response(TaskSerializer(task, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        task = self.get_object()
        task.deleted_at = None
        task.save()
        return Response(TaskSerializer(task, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        self._invalidate_calendar(task)
        task.deleted_at = timezone.now()
        task.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='bulk-complete')
    def bulk_complete(self, request):
        ids = request.data.get('ids', [])
        updated = Task.objects.filter(user=request.user, id__in=ids).update(
            is_complete=True, completed_at=timezone.now()
        )
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        deleted = Task.objects.filter(user=request.user, id__in=ids).update(
            deleted_at=timezone.now()
        )
        return Response({'deleted': deleted})

    @action(detail=False, methods=['post'], url_path='bulk-reschedule')
    def bulk_reschedule(self, request):
        ids = request.data.get('ids', [])
        due_date = request.data.get('due_date')
        rescheduled = Task.objects.filter(user=request.user, id__in=ids).update(due_date=due_date)
        return Response({'rescheduled': rescheduled})


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
