from rest_framework import serializers

from main.models import AudienceImpression


class AudienceImpressionIngestItemSerializer(serializers.Serializer):
    """A single face observation reported by the edge agent."""

    timestamp = serializers.DateTimeField()
    face_count = serializers.IntegerField(min_value=1, default=1)
    avg_dwell_ms = serializers.IntegerField(min_value=0, default=0)
    age_bucket = serializers.ChoiceField(
        choices=[c[0] for c in AudienceImpression.AGE_BUCKETS], default="unknown"
    )
    gender = serializers.ChoiceField(
        choices=[c[0] for c in AudienceImpression.GENDERS], default="unknown"
    )
    emotion = serializers.ChoiceField(
        choices=[c[0] for c in AudienceImpression.EMOTIONS], default="unknown", required=False
    )
    attention_score = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.0)
    video_id = serializers.IntegerField(required=False, allow_null=True)


class AudienceIngestBatchSerializer(serializers.Serializer):
    """Batch payload POSTed by the edge agent every few seconds."""

    screen_id = serializers.IntegerField()
    ads_manager_id = serializers.IntegerField(required=False, allow_null=True)
    impressions = AudienceImpressionIngestItemSerializer(many=True)


class AudienceBreakdownSerializer(serializers.Serializer):
    """Aggregated audience metrics for a campaign or screen."""

    total_impressions = serializers.IntegerField()
    unique_viewers = serializers.IntegerField()
    avg_dwell_seconds = serializers.FloatField()
    avg_attention = serializers.FloatField()
    by_age = serializers.DictField(child=serializers.IntegerField())
    by_gender = serializers.DictField(child=serializers.IntegerField())
    by_emotion = serializers.DictField(child=serializers.IntegerField())
    hourly = serializers.ListField(child=serializers.DictField())
    last_updated = serializers.DateTimeField(allow_null=True)
