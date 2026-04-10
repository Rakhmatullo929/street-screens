"""
Street Screens edge audience agent.

Opens the laptop webcam, runs face detection + age/gender estimation,
and streams **aggregated counters only** to the backend. No images,
no biometric vectors ever leave the device.

Usage:
    python agent.py --screen 1 --api http://localhost:8000
    python agent.py --screen 1 --ads-manager 7 --interval 5 --mock
    python agent.py --screen 1 --mock   # no camera, synthetic faces

Flags:
    --screen        ScreenManager.id to attribute impressions to (required)
    --ads-manager   Optional AdsManager.id to attribute impressions to
    --api           Backend URL (default http://localhost:8000)
    --interval      Seconds between batches (default 5)
    --fps           Detection frames per second (default 4)
    --camera        cv2.VideoCapture index (default 0)
    --mock          Don't open camera, synthesize faces (demo fallback)
    --show          Open a preview window with bounding boxes (requires display)
"""

from __future__ import annotations

import argparse
import logging
import random
import signal
import sys
import time
from datetime import datetime, timezone
from typing import Dict, List

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("edge-agent")

_RUNNING = True


def _handle_sigint(signum, frame):
    global _RUNNING
    logger.info("Received signal %s, shutting down", signum)
    _RUNNING = False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Street Screens audience edge agent")
    parser.add_argument("--screen", type=int, required=True, help="ScreenManager.id")
    parser.add_argument("--ads-manager", type=int, default=None, help="Optional AdsManager.id")
    parser.add_argument("--api", default="http://localhost:8000", help="Backend base URL")
    parser.add_argument("--interval", type=float, default=5.0, help="Seconds between uploads")
    parser.add_argument("--fps", type=float, default=4.0, help="Detection frames per second")
    parser.add_argument("--camera", type=int, default=0, help="cv2.VideoCapture index")
    parser.add_argument("--mock", action="store_true", help="No camera, synthesize faces")
    parser.add_argument("--show", action="store_true", help="Preview window with boxes")
    return parser.parse_args()


def _mock_observations() -> List:
    """Produce 0..3 fake FaceObservation-like dicts for demo without a camera."""
    n = random.choices([0, 1, 2, 3], weights=[2, 5, 3, 1], k=1)[0]
    bucket = ["0-17", "18-24", "25-34", "35-44", "45-54", "55+"]
    return [
        {
            "age_bucket": random.choice(bucket),
            "gender": random.choice(["male", "female"]),
            "emotion": random.choice(["neutral", "happy", "surprised"]),
            "attention_score": round(random.uniform(0.4, 0.95), 2),
            "dwell_ms": random.randint(800, 6500),
        }
        for _ in range(n)
    ]


def _to_payload_item(obs, dwell_ms: int) -> Dict:
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "face_count": 1,
        "avg_dwell_ms": dwell_ms,
        "age_bucket": obs["age_bucket"] if isinstance(obs, dict) else obs.age_bucket,
        "gender": obs["gender"] if isinstance(obs, dict) else obs.gender,
        "emotion": obs["emotion"] if isinstance(obs, dict) else obs.emotion,
        "attention_score": obs["attention_score"] if isinstance(obs, dict) else obs.attention_score,
    }


def run() -> int:
    args = parse_args()
    signal.signal(signal.SIGINT, _handle_sigint)
    signal.signal(signal.SIGTERM, _handle_sigint)

    from uploader import AudienceUploader

    uploader = AudienceUploader(
        api_url=args.api,
        screen_id=args.screen,
        ads_manager_id=args.ads_manager,
    )

    cap = None
    detector = None
    if not args.mock:
        try:
            import cv2

            cap = cv2.VideoCapture(args.camera)
            if not cap.isOpened():
                logger.warning("Camera %d not available, switching to mock mode", args.camera)
                cap = None
        except Exception as exc:
            logger.warning("cv2 unavailable (%s), switching to mock mode", exc)
            cap = None

        if cap is not None:
            from detector import FaceDetector

            detector = FaceDetector()
            detector.ensure_loaded()
            logger.info("Detector mode: %s", detector.mode)

    frame_interval = 1.0 / max(0.5, args.fps)
    batch: List[Dict] = []
    last_flush = time.time()

    logger.info(
        "Agent started (screen=%s, ads_manager=%s, api=%s, mock=%s)",
        args.screen,
        args.ads_manager,
        args.api,
        cap is None,
    )

    try:
        while _RUNNING:
            loop_start = time.time()

            if cap is not None and detector is not None:
                ok, frame = cap.read()
                if not ok:
                    logger.warning("Camera read failed, flipping to mock for this cycle")
                    observations = _mock_observations()
                    for obs in observations:
                        batch.append(_to_payload_item(obs, obs["dwell_ms"]))
                else:
                    observations = detector.detect(frame)
                    for obs in observations:
                        # Rough dwell proxy: bigger bounding box ~ closer ~ longer look
                        dwell_ms = int(1500 + obs.bbox_area * 20000)
                        batch.append(_to_payload_item(obs, dwell_ms))
                    if args.show:
                        try:
                            import cv2

                            for obs in observations:
                                cv2.putText(
                                    frame,
                                    f"{obs.age_bucket} {obs.gender} att={obs.attention_score:.2f}",
                                    (20, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX,
                                    0.6,
                                    (0, 255, 0),
                                    2,
                                )
                            cv2.imshow("Street Screens Edge Agent", frame)
                            if cv2.waitKey(1) & 0xFF == ord("q"):
                                break
                        except Exception:
                            pass
            else:
                observations = _mock_observations()
                for obs in observations:
                    batch.append(_to_payload_item(obs, obs["dwell_ms"]))

            now = time.time()
            if now - last_flush >= args.interval and batch:
                uploader.send(batch)
                batch = []
                last_flush = now

            elapsed = time.time() - loop_start
            if elapsed < frame_interval:
                time.sleep(frame_interval - elapsed)
    finally:
        if batch:
            uploader.send(batch)
        if cap is not None:
            cap.release()
        if args.show:
            try:
                import cv2

                cv2.destroyAllWindows()
            except Exception:
                pass
        logger.info("Agent stopped")

    return 0


if __name__ == "__main__":
    sys.exit(run())
