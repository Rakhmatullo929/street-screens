# Street Screens Edge Agent

Privacy-preserving audience measurement agent for DOOH screens.

Runs on a laptop/Raspberry Pi/Jetson rigged next to a physical screen, uses the
webcam to count and bucket people watching the display, and streams aggregate
counters (age bucket, gender, dwell, attention) to the Street Screens backend.

**No images or biometric vectors ever leave the device.**

## Quick start

```bash
cd edge-agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run against a local backend with the real webcam
python agent.py --screen 1 --api http://localhost:8000

# Demo mode without a camera (synthetic faces) — for defending the thesis
python agent.py --screen 1 --mock

# With a live preview window
python agent.py --screen 1 --show
```

## Architecture

```
webcam frame  ──► FaceDetector ──► FaceObservation
                   (InsightFace        (age, gender,
                    or Haar fallback)    emotion, attention)

                                    │
                                    ▼
                            AudienceUploader
                           (HTTP batch POST)
                                    │
                                    ▼
             /api/v1/ml/audience/ingest/ ──► AudienceImpression rows
```

If `insightface` can't be loaded (e.g. first run without model weights, or
problematic install on Apple Silicon), the detector automatically falls back to
OpenCV's Haar cascade and randomizes demographics. The demo is still runnable.

## Flags

| Flag | Default | Description |
|---|---|---|
| `--screen` | *required* | `ScreenManager.id` that owns the impressions |
| `--ads-manager` | `None` | Optional `AdsManager.id` to attribute to |
| `--api` | `http://localhost:8000` | Backend base URL |
| `--interval` | `5.0` | Seconds between batch uploads |
| `--fps` | `4.0` | Detection frames per second |
| `--camera` | `0` | `cv2.VideoCapture` index |
| `--mock` | `False` | No camera, synthesize faces |
| `--show` | `False` | Open a preview window with bounding boxes |

## Privacy

The agent reports only:
- count of faces per frame
- coarse age bucket (`0-17` .. `55+`)
- binary gender label or `unknown`
- categorical emotion or `unknown`
- dwell time proxy (ms)
- attention score (0..1)

It never uploads images, frames, embeddings, or IDs that could reidentify
individuals. This is the core ethical guarantee of the Street Screens CV pipeline.
