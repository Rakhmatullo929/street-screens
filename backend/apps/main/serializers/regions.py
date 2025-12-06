from typing import Any, Dict
from rest_framework import serializers

from main.models import Region, District

class DistrictSerializer(serializers.ModelSerializer):
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
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance: District, validated_data: Dict[str, Any]) -> District:
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)

class RegionSerializer(serializers.ModelSerializer):
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
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance: Region, validated_data: Dict[str, Any]) -> Region:
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)
