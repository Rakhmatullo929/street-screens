from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from main.models import VenueType
from main.serializers.venue_type import VenueTypeSerializer, VenueTypeFilterParams


class VenueTypeListCreateView(APIView):
    def get(self, request):
        params = VenueTypeFilterParams.check(request.GET)

        qs = VenueType.objects.all()
        
        # Apply search filter
        if params.get("search_field") and params.get("search_value"):
            search_field = params["search_field"]
            search_value = params["search_value"]
            qs = qs.filter(**{f"{search_field}__icontains": search_value})
        
        # Apply is_active filter
        if params.get("is_active") is not None:
            qs = qs.filter(is_active=params["is_active"])
        
        # Apply sorting
        sort_by = params.get("sort_by", ["name"])
        qs = qs.order_by(*sort_by)

        serializer = VenueTypeSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VenueTypeSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(VenueTypeSerializer(obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VenueTypeDetailView(APIView):
    def get(self, request, pk):
        obj = get_object_or_404(VenueType, pk=pk)
        return Response(VenueTypeSerializer(obj).data)

    def put(self, request, pk):
        obj = get_object_or_404(VenueType, pk=pk)
        serializer = VenueTypeSerializer(obj, data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(VenueTypeSerializer(obj).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = get_object_or_404(VenueType, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
