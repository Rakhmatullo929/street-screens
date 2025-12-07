from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.interest import InterestListCreateView, InterestDetailView
from .views.venue_type import VenueTypeListCreateView, VenueTypeDetailView
from .views.screen_manager import ScreenManagerViewSet
from .views.videos import AdsManagerVideoViewSet
from .views.ads_manager import AdsManagerViewSet
from .views.regions import RegionViewSet
from .views.video_serve import ScreenVideoView, VideoServeView, VideoAnalyticsView
from .views.qr_redirect import QRCodeRedirectView

router = DefaultRouter()
router.register(r'screen-managers', ScreenManagerViewSet, basename='screen-manager')
router.register(r'ads-managers', AdsManagerViewSet, basename='ads-manager')
router.register(r'ads-videos', AdsManagerVideoViewSet, basename='ads-video')
router.register(r'regions', RegionViewSet, basename='region')

urlpatterns = [
    path('', include(router.urls)),
    path('videos/<int:pk>/serve/', VideoServeView.as_view(), name='video-serve'),
    path('videos/<int:pk>/track/', VideoAnalyticsView.as_view(), name='video-analytics'),
    path('ads-videos/<int:pk>/serve/', VideoServeView.as_view(), name='ads-video-serve'),
    path('ads-videos/<int:pk>/track/', VideoAnalyticsView.as_view(), name='ads-video-analytics'),
    path('screen-videos/<int:pk>/', ScreenVideoView.as_view(), name='screen-videos-list'),
    path('qr/<int:ad_id>/', QRCodeRedirectView.as_view(), name='qr-redirect'),
    path("interests/", InterestListCreateView.as_view(), name="interest-list-create"),
    path("interests/<uuid:pk>/", InterestDetailView.as_view(), name="interest-detail"),
    path("venue-types/", VenueTypeListCreateView.as_view(), name="venue-type-list-create"),
    path("venue-types/<uuid:pk>/", VenueTypeDetailView.as_view(), name="venue-type-detail"),
]
