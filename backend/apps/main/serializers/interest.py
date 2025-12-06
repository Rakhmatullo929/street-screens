from rest_framework import serializers
from main.models import Interest


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ["id", "name", "slug", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class InterestFilterParams(serializers.Serializer):
    SORT_FIELDS = ("name", "-name", "created_at", "-created_at")
    search_field = serializers.ChoiceField(
        choices=("name", "slug", "description"),
        required=False
    )
    search_value = serializers.CharField(required=False)
    sort_by = serializers.ListField(child=serializers.ChoiceField(choices=SORT_FIELDS), required=False,
                                    default=["name"])

    @classmethod
    def parse(cls, querydict):
        s = cls(data=querydict)
        s.is_valid(raise_exception=True)
        return s.validated_data

    @classmethod
    def check(cls, querydict):
        return cls.parse(querydict)
