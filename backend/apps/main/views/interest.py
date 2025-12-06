from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from main.models import Interest
from main.serializers.interest import InterestSerializer, InterestFilterParams

class InterestListCreateView(APIView):
    """
    API endpoint for listing and creating interests.
    GET /api/v1/main/interests/ - List interests
    POST /api/v1/main/interests/ - Create interest
    """
    def get(self, request):
        """
        List interests with optional filtering and sorting.
        """
        params = InterestFilterParams.check(request.GET)

        qs = Interest.objects.list(
            sort_by=params.get("sort_by"),
            search_field=params.get("search_field"),
            search_value=params.get("search_value"),
        )

        serializer = InterestSerializer(qs, many=True).data
        return Response(serializer)

    def post(self, request):
        """
        Create a new interest.
        """
        serializer = InterestSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(InterestSerializer(obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterestDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific interest.
    GET /api/v1/main/interests/{id}/ - Get interest
    PUT /api/v1/main/interests/{id}/ - Update interest
    DELETE /api/v1/main/interests/{id}/ - Delete interest
    """
    def get(self, request, pk):
        """
        Retrieve a specific interest by ID.
        """
        obj = get_object_or_404(Interest, pk=pk)
        return Response(InterestSerializer(obj).data)

    def put(self, request, pk):
        """
        Update an existing interest.
        """
        obj = get_object_or_404(Interest, pk=pk)
        serializer = InterestSerializer(obj, data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(InterestSerializer(obj).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """
        Delete an interest.
        """
        obj = get_object_or_404(Interest, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)