import json
import logging

from django.db import transaction
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from main.models import VideoAnalytics, AdsManagerVideo, ScreenManager, AdsManager
from main.serializers.screen_manager import AdsManagerVideoSerializer

logger = logging.getLogger(__name__)


class VideoServeView(View):
    """
    Serve videos with analytics tracking.
    GET /api/v1/main/videos/{id}/serve/ - Serve video file
    POST /api/v1/main/videos/{id}/analytics/ - Track video analytics
    """

    def get(self, request, pk):
        """
        Serve video file and track basic view analytics.
        """
        try:
            # Get AdsManagerVideo
            video = get_object_or_404(AdsManagerVideo, id=pk)

            # Track basic view
            self._track_view(request, video)

            # Serve the video file
            if video.video and hasattr(video.video, "path"):
                import os

                from django.http import FileResponse

                if os.path.exists(video.video.path):
                    response = FileResponse(open(video.video.path, "rb"), content_type="video/mp4")
                    response["Content-Disposition"] = f'inline; filename="{video.video.name}"'
                    return response
                else:
                    raise Http404("Video file not found")
            else:
                raise Http404("Video file not found")

        except Exception as e:
            logger.error(f"Error serving video {pk}: {str(e)}")
            raise Http404("Video not found")

    def post(self, request, pk):
        """
        Track detailed video analytics (watch duration, completion, etc.).
        """
        try:
            # Get AdsManagerVideo
            video = get_object_or_404(AdsManagerVideo, id=pk)

            # Parse analytics data
            data = json.loads(request.body)

            # Track detailed analytics
            self._track_detailed_analytics(request, video, data)

            return JsonResponse({"status": "success"})

        except Exception as e:
            logger.error(f"Error tracking analytics for video {pk}: {str(e)}")
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    def _track_view(self, request, video):
        """
        Track basic video view.
        """
        try:
            with transaction.atomic():
                VideoAnalytics.objects.create(
                    video=video,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    referer=request.META.get("HTTP_REFERER", ""),
                    created_by=None,  # Anonymous view
                )
        except Exception as e:
            logger.error(f"Error tracking basic view: {str(e)}")

    def _track_detailed_analytics(self, request, video, data):
        """
        Track detailed video analytics.
        """
        try:
            with transaction.atomic():
                analytics = VideoAnalytics.objects.create(
                    video=video,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    referer=request.META.get("HTTP_REFERER", ""),
                    watch_duration=data.get("watch_duration"),
                    is_complete=data.get("is_complete", False),
                    country=data.get("country"),
                    city=data.get("city"),
                    created_by=None,  # Anonymous view
                )

                logger.info(f"Tracked analytics for video {video.id}: {analytics.id}")

        except Exception as e:
            logger.error(f"Error tracking detailed analytics: {str(e)}")

    def _get_client_ip(self, request):
        """
        Get client IP address.
        """
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip


@method_decorator(csrf_exempt, name="dispatch")
class VideoAnalyticsView(View):
    """
    Handle video analytics tracking.
    """

    def post(self, request, pk):
        """
        Track video analytics data.
        """
        try:
            # Get AdsManagerVideo
            video = get_object_or_404(AdsManagerVideo, id=pk)
            data = json.loads(request.body)

            # Create analytics record
            analytics = VideoAnalytics.objects.create(
                video=video,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                referer=request.META.get("HTTP_REFERER", ""),
                watch_duration=data.get("watch_duration"),
                is_complete=data.get("is_complete", False),
                country=data.get("country"),
                city=data.get("city"),
            )

            return JsonResponse({"status": "success", "analytics_id": analytics.id})

        except Exception as e:
            logger.error(f"Error tracking analytics: {str(e)}")
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    def _get_client_ip(self, request):
        """
        Get client IP address.
        """
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip


class ScreenVideoView(ListAPIView):
    """
    Get videos for a specific screen manager based on region and district.
    GET /api/v1/main/screen-videos/{id}/ - Get videos for screen manager
    """
    permission_classes = [AllowAny]
    serializer_class = AdsManagerVideoSerializer
    
    def get_queryset(self):
        """
        Get videos based on screen manager's region and district.
        """
        screen_manager_id = self.kwargs.get('pk')
        
        try:
            # Get screen manager
            screen_manager = get_object_or_404(ScreenManager, id=screen_manager_id)
            
            # Get region and district from screen manager
            region = screen_manager.region
            district = screen_manager.district
            
            if not region and not district:
                # If no region/district specified, return empty queryset
                return AdsManagerVideo.objects.none()
            
            # Build filter for AdsManager
            ads_manager_filter = {}
            if region:
                ads_manager_filter['region'] = region
            if district:
                ads_manager_filter['district'] = district
            
            # Get AdsManagers that match the region/district
            matching_ads_managers = AdsManager.objects.filter(**ads_manager_filter)
            
            # Get videos from matching ads managers
            return AdsManagerVideo.objects.filter(
                ads_manager__in=matching_ads_managers
            ).select_related('ads_manager')
            
        except Exception as e:
            logger.error(f"Error getting videos for screen manager {screen_manager_id}: {str(e)}")
            return AdsManagerVideo.objects.none()
    