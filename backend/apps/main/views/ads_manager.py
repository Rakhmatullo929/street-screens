import random
from django.db import models
from django.db.models import Avg, QuerySet, Count
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer

from ..models import AdsManager
from ..serializers.screen_manager import AdsManagerSerializer, SummarySerializer


class AdsManagerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AdsManager instances.
    
    All operations are scoped to the authenticated user - users can only access
    ads managers they created. Requires authentication.

    Provides CRUD operations:
    - GET /api/v1/main/ads-managers/ - List user's ads managers
    - POST /api/v1/main/ads-managers/ - Create a new ads manager
    - GET /api/v1/main/ads-managers/{id}/ - Retrieve a specific ads manager
    - PUT /api/v1/main/ads-managers/{id}/ - Update an ads manager
    - PATCH /api/v1/main/ads-managers/{id}/ - Partially update an ads manager
    - DELETE /api/v1/main/ads-managers/{id}/ - Delete an ads manager
    """

    serializer_class = AdsManagerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "currency", "region", "district", "venue_types"]
    search_fields = ["campaign_name", "region__name", "district__name"]
    ordering_fields = ["created_at", "updated_at", "campaign_name", "budget", "start_date", "end_date"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[AdsManager]:
        """
        Returns ads managers filtered by the current user.
        All operations are scoped to the authenticated user's ads managers.
        """
        # Always filter by the current user - users can only see their own ads managers
        return AdsManager.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer: BaseSerializer[AdsManager]) -> None:
        """
        Set the created_by field to the current user when creating a new ads manager.
        """
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer: BaseSerializer[AdsManager]) -> None:
        """
        Set the updated_by field to the current user when updating an ads manager.
        """
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=["get"])
    def active(self, request: Request) -> Response:
        """
        Get only active ads managers for the current user.
        GET /api/v1/main/ads-managers/active/
        """
        active_campaigns = self.get_queryset().filter(status=AdsManager.ACTIVE)
        serializer = self.get_serializer(active_campaigns, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def draft(self, request: Request) -> Response:
        """
        Get only draft ads managers for the current user.
        GET /api/v1/main/ads-managers/draft/
        """
        draft_campaigns = self.get_queryset().filter(status=AdsManager.DRAFT)
        serializer = self.get_serializer(draft_campaigns, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def paused(self, request: Request) -> Response:
        """
        Get only paused ads managers for the current user.
        GET /api/v1/main/ads-managers/paused/
        """
        paused_campaigns = self.get_queryset().filter(status=AdsManager.PAUSED)
        serializer = self.get_serializer(paused_campaigns, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def completed(self, request: Request) -> Response:
        """
        Get only completed ads managers for the current user.
        GET /api/v1/main/ads-managers/completed/
        """
        completed_campaigns = self.get_queryset().filter(status=AdsManager.COMPLETED)
        serializer = self.get_serializer(completed_campaigns, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def activate(self, request: Request, pk: str | None = None) -> Response:
        """
        Activate an ads manager campaign.
        POST /api/v1/main/ads-managers/{id}/activate/
        """
        ads_manager = self.get_object()
        ads_manager.status = AdsManager.ACTIVE
        ads_manager.updated_by = request.user
        ads_manager.save()
        serializer = self.get_serializer(ads_manager)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def pause(self, request: Request, pk: str | None = None) -> Response:
        """
        Pause an ads manager campaign.
        POST /api/v1/main/ads-managers/{id}/pause/
        """
        ads_manager = self.get_object()
        ads_manager.status = AdsManager.PAUSED
        ads_manager.updated_by = request.user
        ads_manager.save()
        serializer = self.get_serializer(ads_manager)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def complete(self, request: Request, pk: str | None = None) -> Response:
        """
        Mark an ads manager campaign as completed.
        POST /api/v1/main/ads-managers/{id}/complete/
        """
        ads_manager = self.get_object()
        ads_manager.status = AdsManager.COMPLETED
        ads_manager.updated_by = request.user
        ads_manager.save()
        serializer = self.get_serializer(ads_manager)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request: Request) -> Response:
        """
        Get statistics about the current user's ads managers.
        GET /api/v1/main/ads-managers/stats/
        """
        queryset = self.get_queryset()
        stats = {
            "total": queryset.count(),
            "active": queryset.filter(status=AdsManager.ACTIVE).count(),
            "draft": queryset.filter(status=AdsManager.DRAFT).count(),
            "paused": queryset.filter(status=AdsManager.PAUSED).count(),
            "completed": queryset.filter(status=AdsManager.COMPLETED).count(),
            "total_budget": float(queryset.aggregate(total=models.Sum('budget'))['total'] or 0),
        }
        return Response(stats)

    @action(detail=False, methods=["get"])
    def aggregate_by_status(self, request: Request) -> Response:
        """
        Get aggregated count of ads managers grouped by status for the current user.
        GET /api/v1/main/ads-managers/aggregate_by_status/
        """
        from django.db.models import Sum
        
        queryset = self.get_queryset()
        
        # Aggregate by status with count and budget
        status_aggregation = queryset.values('status').annotate(
            count=Count('id'),
            total_budget=Sum('budget')
        ).order_by('status')
        
        # Create status groups with display names
        status_groups = []
        for item in status_aggregation:
            status_value = item['status']
            count = item['count']
            total_budget = float(item['total_budget'] or 0)
            
            # Get status display name
            status_display = dict(AdsManager.STATUS_CHOICES).get(status_value, f"Unknown ({status_value})")
            
            status_groups.append({
                "status": status_value,
                "status_display": status_display,
                "count": count,
                "total_budget": total_budget
            })
        
        # Calculate total count and budget
        total_count = queryset.count()
        total_budget = float(queryset.aggregate(total=Sum('budget'))['total'] or 0)
        
        return Response({
            "status_groups": status_groups,
            "total": total_count,
            "total_budget": total_budget
        })

    @action(detail=False, methods=["get"])
    def regions(self, request: Request) -> Response:
        """
        Get all unique regions for the current user's ads managers.
        GET /api/v1/main/ads-managers/regions/
        """
        queryset = self.get_queryset()
        
        # Get unique regions with count
        regions_data = queryset.values('geo_region').annotate(
            count=Count('id')
        ).order_by('geo_region')
        
        # Format the response
        regions = [
            {
                "region": item['geo_region'],
                "count": item['count']
            }
            for item in regions_data if item['geo_region']
        ]
        
        return Response({
            "regions": regions,
            "total_regions": len(regions)
        })

    @action(detail=False, methods=["get"])
    def districts(self, request: Request) -> Response:
        """
        Get all unique districts for the current user's ads managers.
        GET /api/v1/main/ads-managers/districts/
        """
        queryset = self.get_queryset()
        
        # Get unique districts with count
        districts_data = queryset.values('district__id', 'district__name', 'district__code').annotate(
            count=Count('id')
        ).order_by('district__name')
        
        # Format the response
        districts = [
            {
                "id": item['district__id'],
                "name": item['district__name'],
                "code": item['district__code'],
                "count": item['count']
            }
            for item in districts_data if item['district__id']
        ]
        
        return Response({
            "districts": districts,
            "total_districts": len(districts)
        })

    @action(detail=False, methods=["get"])
    def interests(self, request: Request) -> Response:
        """
        Get all unique interests for the current user's ads managers.
        GET /api/v1/main/ads-managers/interests/
        """
        queryset = self.get_queryset()
        
        # Get unique interests with count
        interests_data = queryset.values('interests__id', 'interests__name', 'interests__slug').annotate(
            count=Count('id')
        ).order_by('interests__name')
        
        # Format the response
        interests = [
            {
                "id": item['interests__id'],
                "name": item['interests__name'],
                "slug": item['interests__slug'],
                "count": item['count']
            }
            for item in interests_data if item['interests__id']
        ]
        
        return Response({
            "interests": interests,
            "total_interests": len(interests)
        })

    @action(detail=False, methods=["get"])
    def venue_types(self, request: Request) -> Response:
        """
        Get all unique venue types for the current user's ads managers.
        GET /api/v1/main/ads-managers/venue_types/
        """
        queryset = self.get_queryset()
        
        # Get unique venue types with count
        venue_types_data = queryset.values('venue_types__id', 'venue_types__name', 'venue_types__slug').annotate(
            count=Count('id')
        ).order_by('venue_types__name')
        
        # Format the response
        venue_types = [
            {
                "id": item['venue_types__id'],
                "name": item['venue_types__name'],
                "slug": item['venue_types__slug'],
                "count": item['count']
            }
            for item in venue_types_data if item['venue_types__id']
        ]
        
        return Response({
            "venue_types": venue_types,
            "total_venue_types": len(venue_types)
        })

    @action(detail=False, methods=["get"])
    def filter_by_interest(self, request: Request) -> Response:
        """
        Filter ads managers by interest ID.
        GET /api/v1/main/ads-managers/filter_by_interest/?interest_id=1
        """
        interest_id = request.query_params.get('interest_id')
        if not interest_id:
            return Response({"error": "interest_id parameter is required"}, status=400)
        
        try:
            interest_id = int(interest_id)
        except ValueError:
            return Response({"error": "interest_id must be a valid integer"}, status=400)
        
        filtered_campaigns = self.get_queryset().filter(interests__id=interest_id)
        serializer = self.get_serializer(filtered_campaigns, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def filter_by_venue_type(self, request: Request) -> Response:
        """
        Filter ads managers by venue type ID.
        GET /api/v1/main/ads-managers/filter_by_venue_type/?venue_type_id=1
        """
        venue_type_id = request.query_params.get('venue_type_id')
        if not venue_type_id:
            return Response({"error": "venue_type_id parameter is required"}, status=400)
        
        try:
            venue_type_id = int(venue_type_id)
        except ValueError:
            return Response({"error": "venue_type_id must be a valid integer"}, status=400)
        
        filtered_campaigns = self.get_queryset().filter(venue_types__id=venue_type_id)
        serializer = self.get_serializer(filtered_campaigns, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def summary(self, request: Request) -> Response:
        """
        Get summary of ads managers with efficiency forecast.
        GET /api/v1/main/ads-managers/summary/
        
        Returns efficiency forecast data:
        - If region and district are provided: random CPM and screens count
        - If region or district is missing: returns 0 for both values
        """
        params = dict(request.GET.dict())
        params['interests'] = [int(interest) for interest in request.GET.getlist('interests[]')]
        params['venue_types'] = [int(venue_type) for venue_type in request.GET.getlist('venue_types[]')]
        serializer = SummarySerializer(data=params)
        serializer.is_valid(raise_exception=True)
        
        district = serializer.validated_data.get('district')
        region = serializer.validated_data.get('region')
        venue_types = serializer.validated_data.get('venue_types')
        interests = serializer.validated_data.get('interests')

        # Check if we have both region and district for forecast
        if not region or not district:
            # Return 0 values if region or district is missing
            return Response({
                "cpm": 0,
                "screens_count": 0,
                "impressions": 0,
                "reach": 0,
                "frequency": 0,
                "estimated_cost": 0,
                "budget_utilization": 0,
                "message": "Region and district are required for efficiency forecast"
            })

        # Generate random forecast data when region and district are available
        # Base multipliers based on region (larger regions = more screens and higher CPM)
        region_multipliers = {
            1: 0.8,   # Toshkent viloyati
            2: 0.6,   # Andijon viloyati
            3: 0.5,   # Buxoro viloyati
            4: 0.7,   # Farg'ona viloyati
            7: 0.4,   # Namangan viloyati
            10: 0.3,  # Qoraqalpog'iston
            11: 0.6,  # Samarqand viloyati
            14: 1.0,  # Toshkent shahri (capital)
        }

        region_multiplier = region_multipliers.get(region, 0.5)
        
        # Generate random but realistic data
        base_screens = max(1, int(random.uniform(10, 50) * region_multiplier))
        base_cpm = round(random.uniform(10, 30), 2)  # $10-30 CPM
        base_impressions = int(random.uniform(50000, 150000) * region_multiplier)
        
        screens_count = base_screens
        cpm = base_cpm
        impressions = base_impressions
        reach = int(impressions * (0.3 + random.uniform(0, 0.4)))  # 30-70% reach
        frequency = round(impressions / reach, 2) if reach > 0 else 0
        estimated_cost = round((impressions / 1000) * cpm, 2)
        
        # Get budget from request if provided
        budget = float(request.GET.get('budget', 10000))
        budget_utilization = min((estimated_cost / budget) * 100, 100) if budget > 0 else 0

        return Response({
            "cpm": cpm,
            "screens_count": screens_count,
            "impressions": impressions,
            "reach": reach,
            "frequency": frequency,
            "estimated_cost": estimated_cost,
            "budget_utilization": round(budget_utilization, 2),
            "region_multiplier": region_multiplier,
            "message": "Efficiency forecast generated based on selected region and district"
        })
