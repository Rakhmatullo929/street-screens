# analytics/serializers.py
from rest_framework import serializers


class PopularTimesRequestSerializer(serializers.Serializer):
    """
    Serializer for validating popular times API request parameters.
    """
    q = serializers.CharField(
        required=True,
        help_text="Текстовый запрос к Google Maps (например, 'Humo Arena Tashkent')",
    )
    language = serializers.ChoiceField(
        choices=[("en", "English"), ("ru", "Russian"), ("uz", "Uzbek")],
        default="en",
        required=False,
    )