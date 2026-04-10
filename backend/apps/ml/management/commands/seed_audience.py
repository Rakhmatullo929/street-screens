"""
Seed synthetic AudienceImpression rows so the Performance dashboard has data
without needing to run the edge-agent. Calibrated against DOOH heuristics:
  - mornings skew older/male (commuters),
  - evenings skew younger, more happy emotions,
  - weekends bump shopping-center venues.

Usage:
    python manage.py seed_audience --hours 48
    python manage.py seed_audience --hours 72 --reset
"""

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from main.models import AdsManager, AudienceImpression, ScreenManager

AGE_BUCKETS = ["0-17", "18-24", "25-34", "35-44", "45-54", "55+"]
GENDERS = ["male", "female"]
EMOTIONS = ["neutral", "happy", "neutral", "happy", "surprised", "sad"]


def _age_weights_for_hour(hour: int):
    # morning commute -> older, evening -> younger
    if 6 <= hour < 10:
        return [0.02, 0.1, 0.25, 0.3, 0.2, 0.13]
    if 10 <= hour < 16:
        return [0.08, 0.15, 0.25, 0.22, 0.18, 0.12]
    if 16 <= hour < 21:
        return [0.1, 0.28, 0.3, 0.17, 0.1, 0.05]
    return [0.03, 0.12, 0.2, 0.25, 0.25, 0.15]


def _footfall_multiplier(hour: int, weekday: int) -> float:
    # weekday=0 Monday .. 6 Sunday
    base = 0.2
    if 7 <= hour < 10:
        base = 1.0
    elif 10 <= hour < 12:
        base = 0.6
    elif 12 <= hour < 14:
        base = 1.2
    elif 14 <= hour < 18:
        base = 0.8
    elif 18 <= hour < 22:
        base = 1.4
    if weekday >= 5:  # weekend bump
        base *= 1.15
    return base


class Command(BaseCommand):
    help = "Generate synthetic audience impressions for demo."

    def add_arguments(self, parser):
        parser.add_argument("--hours", type=int, default=48, help="How many past hours to fill")
        parser.add_argument("--reset", action="store_true", help="Delete existing audience impressions first")
        parser.add_argument(
            "--per-hour", type=int, default=40, help="Base number of samples per screen per hour"
        )

    def handle(self, *args, **opts):
        if opts["reset"]:
            deleted, _ = AudienceImpression.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing audience rows"))

        screens = list(ScreenManager.objects.all())
        if not screens:
            self.stdout.write(self.style.ERROR("No ScreenManager rows — seed screens first."))
            return

        campaigns = list(AdsManager.objects.filter(status=AdsManager.ACTIVE))
        hours = opts["hours"]
        per_hour = opts["per_hour"]
        now = timezone.now().replace(minute=0, second=0, microsecond=0)

        batch = []
        created_total = 0
        for hours_ago in range(hours):
            slot = now - timedelta(hours=hours_ago)
            for screen in screens:
                multiplier = _footfall_multiplier(slot.hour, slot.weekday())
                n_samples = max(1, int(per_hour * multiplier * random.uniform(0.6, 1.3)))
                age_weights = _age_weights_for_hour(slot.hour)
                campaign = random.choice(campaigns) if campaigns else None

                for _ in range(n_samples):
                    ts = slot + timedelta(seconds=random.randint(0, 3599))
                    age = random.choices(AGE_BUCKETS, weights=age_weights, k=1)[0]
                    gender = random.choice(GENDERS)
                    # evenings and younger = more positive emotions
                    if slot.hour >= 18 and age in {"18-24", "25-34"}:
                        emotion = random.choice(["happy", "happy", "neutral", "surprised"])
                    else:
                        emotion = random.choice(EMOTIONS)
                    attention = round(random.uniform(0.35, 0.95), 2)
                    dwell = random.randint(800, 6500)

                    batch.append(
                        AudienceImpression(
                            screen=screen,
                            ads_manager=campaign,
                            timestamp=ts,
                            face_count=1,
                            avg_dwell_ms=dwell,
                            age_bucket=age,
                            gender=gender,
                            emotion=emotion,
                            attention_score=attention,
                        )
                    )

                    if len(batch) >= 1000:
                        AudienceImpression.objects.bulk_create(batch)
                        created_total += len(batch)
                        batch = []

        if batch:
            AudienceImpression.objects.bulk_create(batch)
            created_total += len(batch)

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_total} AudienceImpression rows across {len(screens)} screens."
            )
        )
