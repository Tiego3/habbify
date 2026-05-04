from rest_framework import serializers
from .models import Habit, HabitLog


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'date', 'completed', 'note']


class HabitSerializer(serializers.ModelSerializer):
    is_completed_today = serializers.SerializerMethodField()
    current_streak = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    is_scheduled_today = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            'id', 'name', 'category', 'frequency', 'custom_days', 'color',
            'grace_days', 'is_archived', 'created_at',
            'is_completed_today', 'current_streak', 'completion_rate', 'is_scheduled_today',
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_completed_today(self, obj):
        return obj.is_completed_today()

    def get_current_streak(self, obj):
        return obj.get_current_streak()

    def get_completion_rate(self, obj):
        return obj.get_completion_rate()

    def get_is_scheduled_today(self, obj):
        return obj.is_scheduled_today()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class HabitStatsSerializer(serializers.Serializer):
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    completion_rate = serializers.IntegerField()
    heatmap_data = serializers.ListField()
