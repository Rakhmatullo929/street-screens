from __future__ import annotations

import logging
import threading
from typing import Any, Optional

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from main.models import ScreenManager
from main.services.popular_times import PopularTimesService, PopularTimesServiceError

logger = logging.getLogger(__name__)


_thread_locals = threading.local()


def _get_coordinates_from_json(coordinates: Optional[dict[str, Any]]) -> Optional[tuple[float, float]]:
    """
    Extract latitude and longitude from coordinates JSON field.
    
    Args:
        coordinates: Dictionary with 'lat' and 'lng' keys
    
    Returns:
        Tuple of (latitude, longitude) or None if invalid
    """
    if not coordinates or not isinstance(coordinates, dict):
        return None
    
    lat = coordinates.get("lat")
    lng = coordinates.get("lng")
    
    if lat is None or lng is None:
        return None
    
    try:
        return (float(lat), float(lng))
    except (ValueError, TypeError):
        return None


def _coordinates_changed(old_coords: Optional[dict], new_coords: Optional[dict]) -> bool:
    """
    Check if coordinates have changed.
    
    Args:
        old_coords: Previous coordinates dictionary
        new_coords: New coordinates dictionary
    
    Returns:
        True if coordinates changed, False otherwise
    """
    old_tuple = _get_coordinates_from_json(old_coords)
    new_tuple = _get_coordinates_from_json(new_coords)
    
    # If both are None, no change
    if old_tuple is None and new_tuple is None:
        return False
    
    # If one is None and other is not, it's a change
    if old_tuple is None or new_tuple is None:
        return True
    
    # Compare coordinate values
    return old_tuple != new_tuple


def _fetch_and_update_popular_times(screen_manager_id: int, latitude: float, longitude: float) -> None:
    """
    Fetch popular_times from Outscraper API and update ScreenManager.
    This function runs in a background thread.
    
    Args:
        screen_manager_id: ID of the ScreenManager instance
        latitude: Latitude coordinate
        longitude: Longitude coordinate
    """
    try:
        # Initialize the service
        service = PopularTimesService()
        
        # Fetch data from Outscraper
        logger.info(
            f"Fetching popular_times for ScreenManager {screen_manager_id} "
            f"at coordinates ({latitude}, {longitude})"
        )
        
        data = service.fetch_by_coordinates(latitude=latitude, longitude=longitude)
        
        if data and data.get("popular_times"):
            # Update the ScreenManager instance with popular_times
            # We need to use update() to avoid triggering the signal again
            ScreenManager.objects.filter(id=screen_manager_id).update(
                popular_times=data["popular_times"]
            )
            logger.info(
                f"Successfully updated popular_times for ScreenManager {screen_manager_id}"
            )
        else:
            logger.warning(
                f"No popular_times data found for ScreenManager {screen_manager_id} "
                f"at coordinates ({latitude}, {longitude})"
            )
    
    except PopularTimesServiceError as e:
        logger.error(
            f"PopularTimesService error for ScreenManager {screen_manager_id}: {str(e)}"
        )
    except Exception as e:
        logger.exception(
            f"Unexpected error fetching popular_times for ScreenManager {screen_manager_id}: {str(e)}"
        )


@receiver(pre_save, sender=ScreenManager)
def track_coordinate_changes(sender: type[ScreenManager], instance: ScreenManager, **kwargs: Any) -> None:
    """
    Track coordinate changes before saving ScreenManager.
    Stores the old coordinates in thread-local storage for comparison in post_save.
    
    Args:
        sender: ScreenManager model class
        instance: ScreenManager instance being saved
        **kwargs: Additional signal arguments
    """
    # For new instances, there are no old coordinates
    if instance.pk is None:
        _thread_locals.old_coordinates = None
        _thread_locals.is_new = True
        return
    
    # Fetch the old instance from database
    try:
        old_instance = ScreenManager.objects.get(pk=instance.pk)
        _thread_locals.old_coordinates = old_instance.coordinates
        _thread_locals.is_new = False
    except ScreenManager.DoesNotExist:
        _thread_locals.old_coordinates = None
        _thread_locals.is_new = True


@receiver(post_save, sender=ScreenManager)
def fetch_popular_times_on_coordinate_change(
    sender: type[ScreenManager],
    instance: ScreenManager,
    created: bool,
    **kwargs: Any
) -> None:
    """
    Automatically fetch popular_times from Outscraper when coordinates change.
    Runs in a background thread to avoid blocking the main request.
    
    Args:
        sender: ScreenManager model class
        instance: ScreenManager instance that was saved
        created: True if instance was created, False if updated
        **kwargs: Additional signal arguments
    """
    # Get old coordinates from thread-local storage
    old_coordinates = getattr(_thread_locals, "old_coordinates", None)
    new_coordinates = instance.coordinates
    
    # Check if coordinates changed
    has_coordinates_changed = _coordinates_changed(old_coordinates, new_coordinates)
    
    # Only proceed if coordinates changed or this is a new instance with coordinates
    if not has_coordinates_changed and not (created and new_coordinates):
        return
    
    # Extract latitude and longitude
    coords_tuple = _get_coordinates_from_json(new_coordinates)
    if coords_tuple is None:
        logger.warning(
            f"Invalid coordinates for ScreenManager {instance.id}: {new_coordinates}"
        )
        return
    
    latitude, longitude = coords_tuple
    
    # Start background thread to fetch popular_times
    # This ensures the main request is not blocked
    thread = threading.Thread(
        target=_fetch_and_update_popular_times,
        args=(instance.id, latitude, longitude),
        daemon=True,
    )
    thread.start()
    
    logger.info(
        f"Started background task to fetch popular_times for ScreenManager {instance.id}"
    )

