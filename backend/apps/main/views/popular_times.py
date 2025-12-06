from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..serializers.popular_times import PopularTimesRequestSerializer
from ..services.popular_times import PopularTimesService, PopularTimesServiceError

from rest_framework import status


class PopularTimesView(APIView):
    """
    API endpoint to fetch popular times data for a place using Outscraper.
    GET /api/v1/main/popular-times/?q=<place_query>&language=<lang>
    """
    def get(self, request, *args, **kwargs):
        """
        Fetch popular times data for a place by query string.
        Returns place information with popular_times and live_popular_times data.
        """
        serializer = PopularTimesRequestSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        q = serializer.validated_data["q"]
        language = serializer.validated_data.get("language", "en")

        try:
            service = PopularTimesService()
        except PopularTimesServiceError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            data = service.fetch_by_query(query=q, language=language)
        except Exception as e:
            msg = str(e)
            if "402" in msg:
                return Response(
                    {
                        "detail": (
                            "Outscraper: Payment Required (скорее всего "
                            "нет бесплатных кредитов или не настроен биллинг)."
                        ),
                        "outscraper_error": msg,
                    },
                    status=402,
                )

            return Response(
                {"detail": f"Outscraper error: {msg}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not data:
            return Response(
                {"detail": "Place not found or popular_times not available"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(data, status=status.HTTP_200_OK)
