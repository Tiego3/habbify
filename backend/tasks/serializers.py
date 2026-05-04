from rest_framework import serializers
from .models import Task, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.none(), source='tags', write_only=True, required=False
    )
    is_overdue = serializers.SerializerMethodField()
    needs_attention = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'due_date',
            'estimated_minutes', 'actual_minutes', 'tags', 'tag_ids', 'is_complete',
            'completed_at', 'deleted_at', 'created_at', 'updated_at',
            'is_overdue', 'needs_attention',
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request:
            self.fields['tag_ids'].child_relation.queryset = Tag.objects.filter(user=request.user)

    def get_is_overdue(self, obj):
        return obj.is_overdue()

    def get_needs_attention(self, obj):
        return obj.needs_attention()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
