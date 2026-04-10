from django.urls import path

from .views import (
    AudienceIngestView,
    CampaignAudienceView,
    LiveAudienceView,
    ScreenAudienceView,
)

app_name = "ml"

urlpatterns = [
    path("audience/ingest/", AudienceIngestView.as_view(), name="audience-ingest"),
    path("audience/live/", LiveAudienceView.as_view(), name="audience-live"),
    path("audience/campaign/<int:pk>/", CampaignAudienceView.as_view(), name="audience-campaign"),
    path("audience/screen/<int:pk>/", ScreenAudienceView.as_view(), name="audience-screen"),
]
