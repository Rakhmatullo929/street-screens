from __future__ import annotations

from typing import Any, Dict, Optional

from django.conf import settings
from outscraper import ApiClient


class PopularTimesServiceError(Exception):
    """Ошибка при обращении к Outscraper API."""


class PopularTimesService:
    """
    Service for fetching popular times data from Outscraper API.
    """
    def __init__(self, api_key: str | None = None) -> None:
        """
        Initialize service with Outscraper API key.
        Raises PopularTimesServiceError if API key is not configured.
        """
        self.api_key = api_key or settings.OUTSCRAPER_API_KEY
        if not self.api_key:
            raise PopularTimesServiceError("OUTSCRAPER_API_KEY is not configured")
        self.client = ApiClient(api_key=self.api_key)

    def fetch_by_query(
        self,
        query: str,
        language: str = "en",
        limit: int = 1,
    ) -> Optional[Dict[str, Any]]:
        """
        Ищем место по текстовому запросу (например, 'Mega Planet Tashkent')
        и возвращаем данные с popular_times, если они есть.
        """
        # results — это список списков, см. README Outscraper.
        results = self.client.google_maps_search(
            query,
            language=language,
            limit=limit,
        )

        if not results or not results[0]:
            return None

        place = results[0][0] # первый результат первого запроса

        popular_times = place.get("popular_times")
        live_popular_times = place.get("live_popular_times")

        return {
            "query": query,
            "place_id": place.get("place_id"),
            "google_id": place.get("google_id"),
            "name": place.get("name"),
            "full_address": place.get("full_address"),
            "location": {
                "lat": place.get("latitude"),
                "lng": place.get("longitude"),
            },
            # Сырые данные от Outscraper:
            "popular_times": popular_times,
            "live_popular_times": live_popular_times,
            # Можно прокинуть дополнительные поля, если нужно:
            "rating": place.get("rating"),
            "reviews": place.get("reviews"),
            "category": place.get("category"),
            "subtypes": place.get("subtypes"),
        }

    def fetch_by_coordinates(
        self,
        latitude: float,
        longitude: float,
        language: str = "en",
        limit: int = 1,
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch place data by geographic coordinates.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            language: Language code for results (default: 'en')
            limit: Maximum number of results to return (default: 1)
        
        Returns:
            Dictionary with popular_times and coordinates if found, None otherwise.
        """
        try:
            # Search by coordinates using Google Maps search
            query = f"{latitude},{longitude}"
            results = self.client.google_maps_search(
                query,
                language=language,
                limit=limit,
            )

            if not results or not results[0]:
                return None

            place = results[0][0]  # First result from first query
            
            # Extract popular_times data
            popular_times = place.get("popular_times")
            
            # Only return data if we have popular_times
            if not popular_times:
                return None

            return {
                "popular_times": popular_times,
                "coordinates": {
                    "lat": place.get("latitude"),
                    "lng": place.get("longitude"),
                },
            }
        except Exception:
            # Silently fail - caller will handle None response
            return None