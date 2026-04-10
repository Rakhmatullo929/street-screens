"""
Tiny HTTP client that POSTs batches of AudienceImpression payloads to the backend.
Retries with exponential backoff, drops the batch after N failures so the agent
never blocks the detection loop.
"""

from __future__ import annotations

import logging
import time
from typing import Dict, List, Optional

import requests

logger = logging.getLogger(__name__)


class AudienceUploader:
    def __init__(
        self,
        api_url: str,
        screen_id: int,
        ads_manager_id: Optional[int] = None,
        max_retries: int = 3,
        timeout: float = 5.0,
    ):
        self.endpoint = api_url.rstrip("/") + "/api/v1/ml/audience/ingest/"
        self.screen_id = screen_id
        self.ads_manager_id = ads_manager_id
        self.max_retries = max_retries
        self.timeout = timeout
        self.session = requests.Session()

    def send(self, impressions: List[Dict]) -> bool:
        if not impressions:
            return True
        payload = {
            "screen_id": self.screen_id,
            "ads_manager_id": self.ads_manager_id,
            "impressions": impressions,
        }
        delay = 0.5
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = self.session.post(self.endpoint, json=payload, timeout=self.timeout)
                if resp.status_code in (200, 201):
                    logger.info("Uploaded %d impressions (attempt %d)", len(impressions), attempt)
                    return True
                logger.warning(
                    "Upload failed with %s: %s (attempt %d)",
                    resp.status_code,
                    resp.text[:200],
                    attempt,
                )
            except requests.RequestException as exc:
                logger.warning("Upload error: %s (attempt %d)", exc, attempt)
            time.sleep(delay)
            delay *= 2
        logger.error("Dropping batch of %d impressions after %d retries", len(impressions), self.max_retries)
        return False
