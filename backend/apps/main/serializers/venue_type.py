from rest_framework import serializers
from main.models import VenueType


class VenueTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for VenueType model.
    Handles venue type data with auto-generated slug.
    """
    class Meta:
        model = VenueType
        fields = ["id", "name", "slug", "description", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class VenueTypeFilterParams(serializers.Serializer):
    """
    Serializer for filtering and sorting venue type list queries.
    """
    SORT_FIELDS = ("name", "-name", "created_at", "-created_at", "is_active", "-is_active")
    search_field = serializers.ChoiceField(
        choices=("name", "slug", "description"),
        required=False
    )
    search_value = serializers.CharField(required=False)
    sort_by = serializers.ListField(child=serializers.ChoiceField(choices=SORT_FIELDS), required=False,
                                    default=["name"])
    is_active = serializers.BooleanField(required=False)

    @classmethod
    def parse(cls, querydict):
        """
        Parse and validate query parameters for venue type filtering.
        """
        s = cls(data=querydict)
        s.is_valid(raise_exception=True)
        return s.validated_data

    @classmethod
    def check(cls, querydict):
        """
        Alias for parse method to validate query parameters.
        """
        return cls.parse(querydict)
