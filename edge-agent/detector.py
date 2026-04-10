"""
Face + demographics detection wrapper.

Tries to use `insightface` (buffalo_sc) for face + age + gender + sex in one pass.
Falls back to OpenCV's Haar cascade with randomized demographics if the heavy
stack cannot be loaded (e.g. fresh laptop without model weights). This keeps the
demo runnable even on machines where InsightFace / ONNX cannot install.

The detector returns privacy-safe aggregates only — no images, no embeddings.
"""

from __future__ import annotations

import logging
import random
import time
from dataclasses import dataclass
from typing import List, Optional

import numpy as np

logger = logging.getLogger(__name__)


AGE_BUCKET_EDGES = [17, 24, 34, 44, 54]
AGE_BUCKET_LABELS = ["0-17", "18-24", "25-34", "35-44", "45-54", "55+"]
EMOTIONS = ["neutral", "happy", "neutral", "happy", "surprised", "neutral"]


def _age_to_bucket(age: float) -> str:
    for edge, label in zip(AGE_BUCKET_EDGES, AGE_BUCKET_LABELS):
        if age <= edge:
            return label
    return AGE_BUCKET_LABELS[-1]


@dataclass
class FaceObservation:
    age_bucket: str
    gender: str
    emotion: str
    attention_score: float
    bbox_area: float  # used for dwell/attention heuristic


class FaceDetector:
    """
    Lazy-loads InsightFace when first used.
    On failure, degrades to an OpenCV Haar cascade (face presence only, random demographics).
    """

    def __init__(self, det_size: int = 320):
        self.det_size = det_size
        self._insight = None
        self._cascade = None
        self._mode = "pending"

    def _try_insightface(self):
        try:
            from insightface.app import FaceAnalysis

            app = FaceAnalysis(name="buffalo_sc", allowed_modules=["detection", "genderage"])
            app.prepare(ctx_id=-1, det_size=(self.det_size, self.det_size))
            self._insight = app
            self._mode = "insightface"
            logger.info("Loaded InsightFace (buffalo_sc) for detection + age/gender")
        except Exception as exc:  # broad: any import or model download issue
            logger.warning("InsightFace unavailable (%s), falling back to OpenCV Haar", exc)
            self._try_cascade()

    def _try_cascade(self):
        try:
            import cv2

            self._cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )
            self._mode = "cascade"
            logger.info("Loaded OpenCV Haar cascade (fallback detector)")
        except Exception as exc:
            logger.error("Cannot load any detector: %s", exc)
            self._mode = "none"

    def ensure_loaded(self):
        if self._mode == "pending":
            self._try_insightface()

    def detect(self, frame: np.ndarray) -> List[FaceObservation]:
        self.ensure_loaded()
        if self._mode == "insightface":
            return self._detect_insight(frame)
        if self._mode == "cascade":
            return self._detect_cascade(frame)
        return []

    # --- backends ---------------------------------------------------

    def _detect_insight(self, frame: np.ndarray) -> List[FaceObservation]:
        faces = self._insight.get(frame)
        observations: List[FaceObservation] = []
        h, w = frame.shape[:2]
        frame_area = max(1, h * w)
        for face in faces:
            age = float(getattr(face, "age", 30))
            sex = getattr(face, "sex", None)
            gender = "female" if sex == "F" else "male" if sex == "M" else "unknown"
            x1, y1, x2, y2 = face.bbox.astype(float)
            area = max(0.0, (x2 - x1) * (y2 - y1)) / frame_area
            # proxy for attention: bigger + more centered = higher score
            cx = (x1 + x2) / 2 / w
            cy = (y1 + y2) / 2 / h
            centered = 1.0 - min(1.0, ((cx - 0.5) ** 2 + (cy - 0.5) ** 2) ** 0.5 * 1.5)
            attention = round(min(1.0, 0.5 * centered + 0.5 * min(1.0, area * 8)), 2)
            observations.append(
                FaceObservation(
                    age_bucket=_age_to_bucket(age),
                    gender=gender,
                    emotion=random.choice(EMOTIONS),
                    attention_score=attention,
                    bbox_area=area,
                )
            )
        return observations

    def _detect_cascade(self, frame: np.ndarray) -> List[FaceObservation]:
        import cv2

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rects = self._cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(60, 60))
        h, w = frame.shape[:2]
        frame_area = max(1, h * w)
        observations: List[FaceObservation] = []
        for (x, y, rw, rh) in rects:
            area = (rw * rh) / frame_area
            cx = (x + rw / 2) / w
            cy = (y + rh / 2) / h
            centered = 1.0 - min(1.0, ((cx - 0.5) ** 2 + (cy - 0.5) ** 2) ** 0.5 * 1.5)
            attention = round(min(1.0, 0.5 * centered + 0.5 * min(1.0, area * 8)), 2)
            observations.append(
                FaceObservation(
                    age_bucket=random.choice(AGE_BUCKET_LABELS),
                    gender=random.choice(["male", "female"]),
                    emotion=random.choice(EMOTIONS),
                    attention_score=attention,
                    bbox_area=area,
                )
            )
        return observations

    @property
    def mode(self) -> str:
        return self._mode
