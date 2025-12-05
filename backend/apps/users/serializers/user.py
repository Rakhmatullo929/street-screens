from dj_rest_auth.serializers import UserDetailsSerializer


class CustomDetailSerializer(UserDetailsSerializer):
    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ("type_user",)
