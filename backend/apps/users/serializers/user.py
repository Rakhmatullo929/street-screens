from dj_rest_auth.serializers import UserDetailsSerializer


class CustomDetailSerializer(UserDetailsSerializer):
    """
    Custom user details serializer extending UserDetailsSerializer.
    Includes type_user field in user details response.
    """
    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ("type_user",)
