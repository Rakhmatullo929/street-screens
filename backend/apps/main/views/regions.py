from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.main.serializers.regions import RegionSerializer, DistrictSerializer
from main.models import Region, District


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving regions.
    
    Provides read-only operations:
    - GET /api/v1/main/regions/ - List all regions
    - GET /api/v1/main/regions/{id}/ - Retrieve a specific region
    """
    
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["code"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "code", "created_at"]
    ordering = ["name"]
    
    def get_queryset(self) -> QuerySet[Region]:
        """Returns all regions."""
        return Region.objects.all()
    
    @action(detail=True, methods=["get"])
    def districts(self, request: Request, pk: str | None = None) -> Response:
        """
        Get districts for a specific region.
        GET /api/v1/main/regions/{id}/districts/
        """
        region = self.get_object()
        districts = region.districts.all()
        
        # Apply filtering if provided
        search = request.query_params.get('search', None)
        if search:
            districts = districts.filter(name__icontains=search)
        
        # Apply ordering
        ordering = request.query_params.get('ordering', 'name')
        districts = districts.order_by(ordering)
        
        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving districts.
    
    Provides read-only operations:
    - GET /api/v1/main/districts/ - List all districts
    - GET /api/v1/main/districts/{id}/ - Retrieve a specific district
    """
    
    serializer_class = DistrictSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["region", "code"]
    search_fields = ["name", "description", "region__name"]
    ordering_fields = ["name", "code", "created_at", "region__name"]
    ordering = ["region__name", "name"]
    
    def get_queryset(self) -> QuerySet[District]:
        """Returns all districts with region information."""
        return District.objects.select_related('region').all()
    
    @action(detail=False, methods=["get"])
    def by_region(self, request: Request) -> Response:
        """
        Get districts grouped by region.
        GET /api/v1/main/districts/by_region/
        """
        regions = Region.objects.prefetch_related('districts').all()
        
        result = []
        for region in regions:
            districts_data = []
            for district in region.districts.all():
                districts_data.append({
                    "id": district.id,
                    "name": district.name,
                    "code": district.code,
                    "description": district.description,
                })
            
            result.append({
                "region": {
                    "id": region.id,
                    "name": region.name,
                    "code": region.code,
                    "description": region.description,
                },
                "districts": districts_data,
                "district_count": len(districts_data)
            })
        
        return Response(result)
    