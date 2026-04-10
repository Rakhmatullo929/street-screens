import logging
from collections import defaultdict
from datetime import timedelta

from django.db.models import Avg, Count, Max, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from main.models import AdsManager, AudienceImpression, ScreenManager

from .serializers import AudienceBreakdownSerializer, AudienceIngestBatchSerializer

logger = logging.getLogger(__name__)


def _build_breakdown(queryset):
    """
    Aggregate an AudienceImpression queryset into a UI-friendly breakdown.
    Returns a dict that matches AudienceBreakdownSerializer.
    """
    agg = queryset.aggregate(
        total=Sum("face_count"),
        rows=Count("id"),
        dwell=Avg("avg_dwell_ms"),
        attn=Avg("attention_score"),
        last=Max("timestamp"),
    )

    total_impressions = int(agg["total"] or 0)
    unique_viewers = int(agg["rows"] or 0)
    avg_dwell_seconds = round((agg["dwell"] or 0) / 1000.0, 2)
    avg_attention = round(float(agg["attn"] or 0.0), 3)

    # Distributions — single queries, grouped in Python to keep it portable.
    by_age = defaultdict(int)
    by_gender = defaultdict(int)
    by_emotion = defaultdict(int)
    for row in queryset.values("age_bucket", "gender", "emotion", "face_count"):
        by_age[row["age_bucket"] or "unknown"] += row["face_count"]
        by_gender[row["gender"] or "unknown"] += row["face_count"]
        by_emotion[row["emotion"] or "unknown"] += row["face_count"]

    # Hourly buckets for the last 24h window (for the line chart).
    now = timezone.now()
    since = now - timedelta(hours=24)
    hourly_counts = defaultdict(int)
    for row in queryset.filter(timestamp__gte=since).values("timestamp", "face_count"):
        hour_key = row["timestamp"].replace(minute=0, second=0, microsecond=0).isoformat()
        hourly_counts[hour_key] += row["face_count"]
    hourly = [
        {"hour": key, "count": value}
        for key, value in sorted(hourly_counts.items())
    ]

    return {
        "total_impressions": total_impressions,
        "unique_viewers": unique_viewers,
        "avg_dwell_seconds": avg_dwell_seconds,
        "avg_attention": avg_attention,
        "by_age": dict(by_age),
        "by_gender": dict(by_gender),
        "by_emotion": dict(by_emotion),
        "hourly": hourly,
        "last_updated": agg["last"],
    }


class AudienceIngestView(APIView):
    """
    POST /api/v1/ml/audience/ingest/

    Receives a batch of face observations from an edge CV agent.
    Open endpoint (AllowAny) because edge devices are not user-authenticated in this demo.
    In production this should be swapped for a device-token auth backend.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = AudienceIngestBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        screen = get_object_or_404(ScreenManager, id=payload["screen_id"])
        ads_manager = None
        ads_manager_id = payload.get("ads_manager_id")
        if ads_manager_id:
            ads_manager = AdsManager.objects.filter(id=ads_manager_id).first()

        objs = [
            AudienceImpression(
                screen=screen,
                ads_manager=ads_manager,
                video_id=item.get("video_id"),
                timestamp=item["timestamp"],
                face_count=item["face_count"],
                avg_dwell_ms=item["avg_dwell_ms"],
                age_bucket=item["age_bucket"],
                gender=item["gender"],
                emotion=item.get("emotion", "unknown"),
                attention_score=item["attention_score"],
            )
            for item in payload["impressions"]
        ]
        AudienceImpression.objects.bulk_create(objs, batch_size=500)
        logger.info("Ingested %d audience impressions for screen %s", len(objs), screen.id)
        return Response({"status": "ok", "accepted": len(objs)}, status=status.HTTP_201_CREATED)


class CampaignAudienceView(APIView):
    """
    GET /api/v1/ml/audience/campaign/<id>/

    Aggregated audience breakdown for a specific campaign.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        campaign = get_object_or_404(AdsManager, id=pk)
        qs = AudienceImpression.objects.filter(ads_manager=campaign)
        data = _build_breakdown(qs)
        return Response(AudienceBreakdownSerializer(data).data)


class ScreenAudienceView(APIView):
    """
    GET /api/v1/ml/audience/screen/<id>/

    Aggregated audience breakdown for a specific screen.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        screen = get_object_or_404(ScreenManager, id=pk)
        qs = AudienceImpression.objects.filter(screen=screen)
        data = _build_breakdown(qs)
        return Response(AudienceBreakdownSerializer(data).data)


class LiveAudienceView(APIView):
    """
    GET /api/v1/ml/audience/live/?screen=<id>&seconds=300

    Returns the raw count for the last N seconds — used by the 'live now' widget
    to give a real-time pulse during the demo.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        screen_id = request.query_params.get("screen")
        try:
            seconds = int(request.query_params.get("seconds", 300))
        except (TypeError, ValueError):
            seconds = 300
        since = timezone.now() - timedelta(seconds=max(seconds, 10))

        qs = AudienceImpression.objects.filter(timestamp__gte=since)
        if screen_id:
            qs = qs.filter(screen_id=screen_id)

        agg = qs.aggregate(
            total=Sum("face_count"),
            rows=Count("id"),
            attn=Avg("attention_score"),
            last=Max("timestamp"),
        )
        return Response(
            {
                "window_seconds": seconds,
                "total_faces": int(agg["total"] or 0),
                "samples": int(agg["rows"] or 0),
                "avg_attention": round(float(agg["attn"] or 0.0), 3),
                "last_seen": agg["last"],
            }
        )
