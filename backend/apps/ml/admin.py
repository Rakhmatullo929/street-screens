from django.contrib import admin

from main.models import AudienceImpression


@admin.register(AudienceImpression)
class AudienceImpressionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "screen",
        "ads_manager",
        "timestamp",
        "face_count",
        "age_bucket",
        "gender",
        "emotion",
        "attention_score",
    )
    list_filter = ("age_bucket", "gender", "emotion", "screen")
    search_fields = ("screen__title", "ads_manager__campaign_name")
    date_hierarchy = "timestamp"
