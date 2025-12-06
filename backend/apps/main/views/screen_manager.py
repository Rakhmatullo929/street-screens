from django.db.models import QuerySet, Count
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer

from main.models import ScreenManager
from main.serializers.screen_manager import ScreenManagerSerializer


class ScreenManagerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ScreenManager instances.

    All operations are scoped to the authenticated user - users can only access
    screen managers they created. Requires authentication.

    Provides CRUD operations:
    - GET /api/v1/main/screen-managers/ - List user's screen managers
    - POST /api/v1/main/screen-managers/ - Create a new screen manager
    - GET /api/v1/main/screen-managers/{id}/ - Retrieve a specific screen manager
    - PUT /api/v1/main/screen-managers/{id}/ - Update a screen manager
    - PATCH /api/v1/main/screen-managers/{id}/ - Partially update a screen manager
    - DELETE /api/v1/main/screen-managers/{id}/ - Delete a screen manager
    """

    serializer_class = ScreenManagerSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "type_category", "region", "district"]
    search_fields = ["title", "position", "location", "type_category", "screen_size"]
    ordering_fields = ["created_at", "updated_at", "title", "status"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[ScreenManager]:
        """
        Returns screen managers filtered by the current user.
        All operations are scoped to the authenticated user's screen managers.
        """
        # Always filter by the current user - users can only see their own screen managers
        return ScreenManager.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer: BaseSerializer[ScreenManager]) -> None:
        """
        Set the created_by field to the current user when creating a new screen manager.
        """
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer: BaseSerializer[ScreenManager]) -> None:
        """
        Set the updated_by field to the current user when updating a screen manager.
        """
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=["get"])
    def active(self, request: Request) -> Response:
        """
        Get only active screen managers for the current user.
        GET /api/v1/main/screen-managers/active/
        """
        active_screens = self.get_queryset().filter(status=ScreenManager.ACTIVE)
        serializer = self.get_serializer(active_screens, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def inactive(self, request: Request) -> Response:
        """
        Get only inactive screen managers for the current user.
        GET /api/v1/main/screen-managers/inactive/
        """
        inactive_screens = self.get_queryset().filter(status=ScreenManager.INACTIVE)
        serializer = self.get_serializer(inactive_screens, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def maintenance(self, request: Request) -> Response:
        """
        Get only screen managers in maintenance mode for the current user.
        GET /api/v1/main/screen-managers/maintenance/
        """
        maintenance_screens = self.get_queryset().filter(status=ScreenManager.MAINTENANCE)
        serializer = self.get_serializer(maintenance_screens, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def activate(self, request: Request, pk: str | None = None) -> Response:
        """
        Custom action to activate a screen manager.
        POST /api/v1/main/screen-managers/{id}/activate/
        """
        screen_manager = self.get_object()
        screen_manager.status = ScreenManager.ACTIVE
        screen_manager.updated_by = request.user
        screen_manager.save()
        serializer = self.get_serializer(screen_manager)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def deactivate(self, request: Request, pk: str | None = None) -> Response:
        """
        Custom action to deactivate a screen manager.
        POST /api/v1/main/screen-managers/{id}/deactivate/
        """
        screen_manager = self.get_object()
        screen_manager.status = ScreenManager.INACTIVE
        screen_manager.updated_by = request.user
        screen_manager.save()
        serializer = self.get_serializer(screen_manager)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def set_maintenance(self, request: Request, pk: str | None = None) -> Response:
        """
        Custom action to set a screen manager to maintenance mode.
        POST /api/v1/main/screen-managers/{id}/set_maintenance/
        """
        screen_manager = self.get_object()
        screen_manager.status = ScreenManager.MAINTENANCE
        screen_manager.updated_by = request.user
        screen_manager.save()
        serializer = self.get_serializer(screen_manager)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request: Request) -> Response:
        """
        Get statistics about the current user's screen managers.
        GET /api/v1/main/screen-managers/stats/
        """
        queryset = self.get_queryset()
        stats = {
            "total": queryset.count(),
            "active": queryset.filter(status=ScreenManager.ACTIVE).count(),
            "inactive": queryset.filter(status=ScreenManager.INACTIVE).count(),
            "maintenance": queryset.filter(status=ScreenManager.MAINTENANCE).count(),
        }
        return Response(stats)

    @action(detail=False, methods=["get"])
    def aggregate_by_status(self, request: Request) -> Response:
        """
        Get aggregated count of screen managers grouped by status for the current user.
        GET /api/v1/main/screen-managers/aggregate_by_status/

        Returns:
        {
            "status_groups": [
                {"status": 0, "status_display": "Inactive", "count": 5},
                {"status": 1, "status_display": "Active", "count": 10},
                {"status": 2, "status_display": "Maintenance", "count": 2}
            ],
            "total": 17
        }
        """
        from django.db.models import Count

        queryset = self.get_queryset()

        # Aggregate by status with count
        status_aggregation = queryset.values("status").annotate(count=Count("id")).order_by("status")

        # Create status groups with display names
        status_groups = []
        for item in status_aggregation:
            status_value = item["status"]
            count = item["count"]

            # Get status display name
            status_display = dict(ScreenManager.STATUS).get(status_value, f"Unknown ({status_value})")

            status_groups.append({"status": status_value, "status_display": status_display, "count": count})

        # Calculate total count
        total_count = queryset.count()

        return Response({"status_groups": status_groups, "total": total_count})

    @action(detail=False, methods=["get"])
    def positions(self, request: Request) -> Response:
        """
        Get all unique positions for the current user's screen managers.
        GET /api/v1/main/screen-managers/positions/
        
        Returns:
        {
            "positions": [
                {"position": "Lobby", "count": 3},
                {"position": "Reception", "count": 2},
                {"position": "Conference Room", "count": 1}
            ],
            "total_positions": 3
        }
        """
        from django.db.models import Count
        
        queryset = self.get_queryset()
        
        # Get unique positions with count
        positions_data = queryset.values('position').annotate(
            count=Count('id')
        ).order_by('position')
        
        # Format the response
        positions = [
            {
                "position": item['position'],
                "count": item['count']
            }
            for item in positions_data
        ]
        
        return Response({
            "positions": positions,
            "total_positions": len(positions)
        })

    @action(detail=False, methods=["get"])
    def locations(self, request: Request) -> Response:
        """
        Get all unique locations for the current user's screen managers.
        GET /api/v1/main/screen-managers/locations/
        """
        queryset = self.get_queryset()
        
        # Get unique locations with count
        locations_data = queryset.values('location').annotate(
            count=Count('id')
        ).order_by('location')
        
        # Format the response
        locations = [
            {
                "location": item['location'],
                "count": item['count']
            }
            for item in locations_data if item['location']
        ]
        
        return Response({
            "locations": locations,
            "total_locations": len(locations)
        })

    @action(detail=False, methods=["get"])
    def coordinates(self, request: Request) -> Response:
        """
        Get all screen managers with their coordinates for mapping.
        GET /api/v1/main/screen-managers/coordinates/
        """
        queryset = self.get_queryset()
        
        # Get screen managers with coordinates
        screens_with_coords = queryset.filter(
            coordinates__isnull=False
        ).values(
            'id', 'title', 'position', 'location', 'coordinates', 'status'
        )
        
        # Format coordinates for mapping
        coordinates_data = []
        for screen in screens_with_coords:
            if screen['coordinates'] and 'lat' in screen['coordinates'] and 'lng' in screen['coordinates']:
                coordinates_data.append({
                    "id": screen['id'],
                    "title": screen['title'],
                    "position": screen['position'],
                    "location": screen['location'],
                    "coordinates": screen['coordinates'],
                    "status": screen['status']
                })
        
        return Response({
            "screens": coordinates_data,
            "total_screens": len(coordinates_data)
        })
