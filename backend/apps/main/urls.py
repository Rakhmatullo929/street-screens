from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.interest import InterestListCreateView, InterestDetailView
from .views.venue_type import VenueTypeListCreateView, VenueTypeDetailView
from .views.screen_manager import ScreenManagerViewSet
from .views.ads_manager import AdsManagerViewSet
from .views.regions import RegionViewSet

router = DefaultRouter()
router.register(r'screen-managers', ScreenManagerViewSet, basename='screen-manager')
router.register(r'ads-managers', AdsManagerViewSet, basename='ads-manager')
router.register(r'regions', RegionViewSet, basename='region')

urlpatterns = [
    path('', include(router.urls)),
    path("interests/", InterestListCreateView.as_view(), name="interest-list-create"),
    path("interests/<uuid:pk>/", InterestDetailView.as_view(), name="interest-detail"),
    path("venue-types/", VenueTypeListCreateView.as_view(), name="venue-type-list-create"),
    path("venue-types/<uuid:pk>/", VenueTypeDetailView.as_view(), name="venue-type-detail"),
]
