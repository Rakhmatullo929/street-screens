from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model

from rest_framework import serializers

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    type_user = serializers.ChoiceField(choices=User.TYPE_USER, required=False)  # pyright: ignore

    def validate_email(self, email):
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Пользователь с таким e-mail уже зарегистрирован.")
        return super().validate_email(email)

    def custom_signup(self, request, user):
        data = self.validated_data or {}
        if isinstance(data, dict) and ("first_name" in data or "last_name" in data):
            user.first_name = data.get("first_name", "")
            user.last_name = data.get("last_name", "")
            user.type_user = data.get("type_user", "")
            user.save()
