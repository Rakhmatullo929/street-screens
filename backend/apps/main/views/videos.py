from django.db.models import QuerySet, Q, Count
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer

from main.models import VideoAnalytics, AdsManager, AdsManagerVideo
from main.serializers.screen_manager import AdsManagerVideoSerializer


class AdsManagerVideoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AdsManagerVideo instances.
    
    All operations are scoped to the authenticated user - users can only access
    videos for ads managers they created. Requires authentication.

    Provides CRUD operations:
    - GET /api/v1/main/ads-videos/ - List user's ads manager videos
    - POST /api/v1/main/ads-videos/ - Create a new video
    - GET /api/v1/main/ads-videos/{id}/ - Retrieve a specific video
    - PUT /api/v1/main/ads-videos/{id}/ - Update a video
    - PATCH /api/v1/main/ads-videos/{id}/ - Partially update a video
    - DELETE /api/v1/main/ads-videos/{id}/ - Delete a video
    """

    serializer_class = AdsManagerVideoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ads_manager", "ads_manager__status"]
    search_fields = ["title", "description", "ads_manager__campaign_name"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[AdsManagerVideo]:
        """
        Returns videos filtered by the current user's ads managers.
        Users can only see videos for ads managers they created.
        """
        # Filter videos by ads managers that belong to the current user
        return AdsManagerVideo.objects.filter(ads_manager__created_by=self.request.user)

    def perform_create(self, serializer: BaseSerializer[AdsManagerVideo]) -> None:
        """
        Set the created_by field to the current user when creating a new video.
        Also validate that the ads_manager belongs to the current user.
        """
        ads_manager_id = serializer.validated_data.get('ads_manager')
        
        # Ensure the ads manager belongs to the current user
        if not AdsManager.objects.filter(
            id=ads_manager_id.id, 
            created_by=self.request.user
        ).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add videos to your own ads managers.")
        
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer: BaseSerializer[AdsManagerVideo]) -> None:
        """
        Set the updated_by field to the current user when updating a video.
        """
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=["get"])
    def by_ads_manager(self, request: Request) -> Response:
        """
        Get videos grouped by ads manager for the current user.
        GET /api/v1/main/ads-videos/by_ads_manager/
        """
        from django.db.models import Prefetch
        
        # Get user's ads managers with their videos
        ads_managers = AdsManager.objects.filter(
            created_by=self.request.user
        ).prefetch_related(
            Prefetch('videos', queryset=AdsManagerVideo.objects.all())
        )
        
        result = []
        for ads_manager in ads_managers:
            videos_data = []
            for video in ads_manager.videos.all():
                videos_data.append({
                    "id": video.id,
                    "title": video.title,
                    "video": video.video.url if video.video else None,
                    "duration": video.duration,
                    "file_size": video.file_size,
                    "created_at": video.created_at,
                    "updated_at": video.updated_at,
                })
            
            result.append({
                "ads_manager": {
                    "id": ads_manager.id,
                    "campaign_name": ads_manager.campaign_name,
                    "status": ads_manager.status,
                    "budget": float(ads_manager.budget),
                    "currency": ads_manager.currency,
                    "start_date": ads_manager.start_date,
                    "end_date": ads_manager.end_date,
                },
                "videos": videos_data,
                "video_count": len(videos_data)
            })
        
        return Response(result)

    @action(detail=False, methods=["get"])
    def stats(self, request: Request) -> Response:
        """
        Get statistics about the current user's ads videos.
        GET /api/v1/main/ads-videos/stats/
        """
        queryset = self.get_queryset()
        
        # Get video count by ads manager
        video_stats = queryset.values(
            'ads_manager__campaign_name'
        ).annotate(
            video_count=Count('id')
        ).order_by('ads_manager__campaign_name')
        
        stats = {
            "total_videos": queryset.count(),
            "total_ads_managers": queryset.values('ads_manager').distinct().count(),
            "videos_by_ads_manager": list(video_stats)
        }
        
        return Response(stats)

    @action(detail=True, methods=["get"])
    def analytics(self, request: Request, pk: str | None = None) -> Response:
        """
        Get analytics for a specific ads video.
        GET /api/v1/main/ads-videos/{id}/analytics/
        """
        video = self.get_object()
        
        # Get analytics for this video
        analytics = VideoAnalytics.objects.filter(video=video)
        
        # Calculate statistics
        total_views = analytics.count()
        complete_views = analytics.filter(is_complete=True).count()
        unique_ips = analytics.values('ip_address').distinct().count()
        
        # Get recent views (last 10)
        recent_views = analytics.order_by('-created_at')[:10].values(
            'ip_address', 'created_at', 'is_complete', 'country', 'city'
        )
        
        # Get views by country
        views_by_country = analytics.values('country').annotate(
            count=Count('id')
        ).order_by('-count')
        
        stats = {
            "video_id": video.id,
            "video_title": video.title or "Untitled Video",
            "ads_manager_name": video.ads_manager.campaign_name,
            "total_views": total_views,
            "complete_views": complete_views,
            "completion_rate": round((complete_views / total_views * 100) if total_views > 0 else 0, 2),
            "unique_viewers": unique_ips,
            "recent_views": list(recent_views),
            "views_by_country": list(views_by_country)
        }
        
        return Response(stats)

    @action(detail=False, methods=["get"])
    def analytics_summary(self, request: Request) -> Response:
        """
        Get analytics summary for all user's ads videos.
        GET /api/v1/main/ads-videos/analytics_summary/
        """
        from django.db.models import Sum
        
        # Get user's videos
        user_videos = self.get_queryset()
        
        # Get analytics for user's videos
        analytics = VideoAnalytics.objects.filter(video__in=user_videos)
        
        # Calculate overall statistics
        total_views = analytics.count()
        complete_views = analytics.filter(is_complete=True).count()
        unique_viewers = analytics.values('ip_address').distinct().count()
        
        # Get top performing videos
        top_videos = user_videos.annotate(
            view_count=Count('analytics'),
            complete_views=Count('analytics', filter=Q(analytics__is_complete=True))
        ).order_by('-view_count')[:5]
        
        # Get views by ads manager
        views_by_ads_manager = user_videos.values(
            'ads_manager__campaign_name'
        ).annotate(
            total_views=Count('analytics'),
            complete_views=Count('analytics', filter=Q(analytics__is_complete=True))
        ).order_by('-total_views')
        
        summary = {
            "total_videos": user_videos.count(),
            "total_views": total_views,
            "complete_views": complete_views,
            "overall_completion_rate": round((complete_views / total_views * 100) if total_views > 0 else 0, 2),
            "unique_viewers": unique_viewers,
            "top_videos": [
                {
                    "id": video.id,
                    "title": video.title or "Untitled Video",
                    "ads_manager": video.ads_manager.campaign_name,
                    "view_count": video.view_count,
                    "complete_views": video.complete_views,
                    "completion_rate": round((video.complete_views / video.view_count * 100) if video.view_count > 0 else 0, 2)
                }
                for video in top_videos
            ],
            "views_by_ads_manager": list(views_by_ads_manager)
        }
        
        return Response(summary)
