"""
QR Code Redirect View for Ads Manager.

This module provides the view to handle QR code redirects that increment
the visit counter and redirect users to the original ad link.
"""
import logging
from typing import Any

from django.db import transaction, models
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.views import APIView

from ..models import AdsManager

logger = logging.getLogger(__name__)


class QRCodeRedirectView(APIView):
    """
    View to handle QR code redirects.
    
    When accessed with an ad ID, this view will:
    1. Increment the involve_count (visit counter) by 1
    2. Redirect the user to the original saved link
    
    Endpoints:
        GET /api/v1/main/qr/<ad_id>/ - Redirect to the ad's link and increment counter
    """
    
    permission_classes = [AllowAny]  # Public endpoint - no authentication required
    
    def get(self, request: Request, ad_id: int) -> HttpResponse:
        """
        Handle QR code redirect.
        
        Args:
            request: The HTTP request object
            ad_id: The ID of the AdsManager instance
            
        Returns:
            HttpResponseRedirect to the ad's link, or error response if link is missing
        """
        # Get the ads manager or return 404
        ads_manager = get_object_or_404(AdsManager, id=ad_id)
        
        # Check if link exists
        if not ads_manager.link:
            logger.warning(
                f"QR code accessed for AdsManager {ad_id} but no link is set"
            )
            return HttpResponse(
                "This advertisement does not have a destination link configured.",
                status=404
            )
        
        try:
            # Increment the visit counter atomically using F expression
            with transaction.atomic():
                AdsManager.objects.filter(id=ad_id).update(
                    involve_count=models.F('involve_count') + 1
                )
                # Refresh from DB to get updated count
                ads_manager.refresh_from_db()
            
            logger.info(
                f"QR code redirect for AdsManager {ad_id} "
                f"(total visits: {ads_manager.involve_count}) to {ads_manager.link}"
            )
            
            # Redirect to the original link
            return HttpResponseRedirect(redirect_to=ads_manager.link)
            
        except Exception as e:
            logger.error(
                f"Error processing QR code redirect for AdsManager {ad_id}: {str(e)}"
            )
            # Still redirect even if counter increment fails
            return HttpResponseRedirect(redirect_to=ads_manager.link)

