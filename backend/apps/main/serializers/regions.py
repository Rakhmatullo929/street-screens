from typing import Any, Dict
from rest_framework import serializers

from main.models import Region, District

class DistrictSerializer(serializers.ModelSerializer):
    """
    Serializer for District model.
    Handles district data with region relationship.
    """
    class Meta:
        model = District
        fields = [
            "id",
            "name",
            "code",
            "description",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "updated_by"]

    def create(self, validated_data: Dict[str, Any]) -> District:
        """
        Create district and set created_by to current user.
        """
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance: District, validated_data: Dict[str, Any]) -> District:
        """
        Update district and set updated_by to current user.
        """
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)

class RegionSerializer(serializers.ModelSerializer):
    """
    Serializer for Region model.
    Handles region data serialization.
    """
    class Meta:
        model = Region
        fields = [
            "id",
            "name",
            "code",
            "description",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "updated_by"]

    def create(self, validated_data: Dict[str, Any]) -> Region:
        """
        Create region and set created_by to current user.
        """
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance: Region, validated_data: Dict[str, Any]) -> Region:
        """
        Update region and set updated_by to current user.
        """
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)
