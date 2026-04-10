# Generated for CV Audience Measurement feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0005_adsmanager_involve_count_adsmanager_qr_code"),
    ]

    operations = [
        migrations.CreateModel(
            name="AudienceImpression",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("timestamp", models.DateTimeField(db_index=True)),
                ("face_count", models.PositiveIntegerField(default=1)),
                ("avg_dwell_ms", models.PositiveIntegerField(default=0)),
                (
                    "age_bucket",
                    models.CharField(
                        choices=[
                            ("0-17", "0-17"),
                            ("18-24", "18-24"),
                            ("25-34", "25-34"),
                            ("35-44", "35-44"),
                            ("45-54", "45-54"),
                            ("55+", "55+"),
                            ("unknown", "Unknown"),
                        ],
                        default="unknown",
                        max_length=16,
                    ),
                ),
                (
                    "gender",
                    models.CharField(
                        choices=[("male", "Male"), ("female", "Female"), ("unknown", "Unknown")],
                        default="unknown",
                        max_length=8,
                    ),
                ),
                (
                    "emotion",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("neutral", "Neutral"),
                            ("happy", "Happy"),
                            ("sad", "Sad"),
                            ("surprised", "Surprised"),
                            ("angry", "Angry"),
                            ("unknown", "Unknown"),
                        ],
                        default="unknown",
                        max_length=16,
                    ),
                ),
                (
                    "attention_score",
                    models.FloatField(default=0.0, help_text="0..1, how likely the face looked at the screen"),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "ads_manager",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="audience_impressions",
                        to="main.adsmanager",
                    ),
                ),
                (
                    "screen",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="audience_impressions",
                        to="main.screenmanager",
                    ),
                ),
                (
                    "video",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="audience_impressions",
                        to="main.adsmanagervideo",
                    ),
                ),
            ],
            options={
                "verbose_name": "Audience Impression",
                "verbose_name_plural": "Audience Impressions",
                "db_table": "main_audience_impression",
                "ordering": ("-timestamp",),
            },
        ),
        migrations.AddIndex(
            model_name="audienceimpression",
            index=models.Index(fields=["screen", "timestamp"], name="main_audien_screen__idx"),
        ),
        migrations.AddIndex(
            model_name="audienceimpression",
            index=models.Index(fields=["ads_manager", "timestamp"], name="main_audien_ads_man_idx"),
        ),
    ]
