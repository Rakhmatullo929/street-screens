from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.text import slugify

from apps.main.querysets.interest import InterestQuerySet

VENUE_TYPES = [
    ("shopping_center", "Shopping Center"),
    ("streets_and_roads", "Streets and Roads"),
    ("transport", "Transport Hubs"),
    ("office_buildings", "Office Buildings"),
    ("sports_facilities", "Sports Facilities"),
    ("entertainment_centers", "Entertainment Centers"),
]


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False, null=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False, null=True)
    created_by = models.ForeignKey("users.User", models.SET_NULL, "created_%(model_name)ss", null=True, blank=True)
    updated_by = models.ForeignKey("users.User", models.SET_NULL, "updated_%(model_name)ss", null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ("-created_at",)


class Region(BaseModel):
    """
    Model for geographic regions.
    """

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta(BaseModel.Meta):
        db_table = "main_region"
        verbose_name = "Region"
        verbose_name_plural = "Regions"
        ordering = ("name",)

    def __str__(self):
        return self.name


class District(BaseModel):
    """
    Model for districts within regions.
    """

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, blank=True, null=True)
    region = models.ForeignKey("main.Region", models.CASCADE, "districts")
    description = models.TextField(blank=True, null=True)

    class Meta(BaseModel.Meta):
        db_table = "main_district"
        verbose_name = "District"
        verbose_name_plural = "Districts"
        ordering = ("name",)
        unique_together = [["name", "region"]]

    def __str__(self):
        return f"{self.name}, {self.region.name}"


class Interest(BaseModel):
    """
    Normalized interest taxonomy (e.g., Finance, Music, Education).
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, editable=False)
    description = models.CharField(max_length=255, blank=True, null=True)
    objects = InterestQuerySet.as_manager()

    class Meta(BaseModel.Meta):
        db_table = "main_interest"
        verbose_name = "Interest"
        verbose_name_plural = "Interests"
        ordering = ("name",)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class VenueType(BaseModel):
    """
    Model for venue types (e.g., Shopping Center, Transport Hubs).
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, editable=False)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Whether this venue type is available for selection")

    class Meta(BaseModel.Meta):
        db_table = "main_venue_type"
        verbose_name = "Venue Type"
        verbose_name_plural = "Venue Types"
        ordering = ("name",)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ScreenManager(BaseModel):
    INACTIVE = "inactive"
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    STATUS = ((ACTIVE, "Active"), (INACTIVE, "Inactive"), (MAINTENANCE, "Maintenance"))

    title = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True, help_text="Human-readable location description")
    coordinates = models.JSONField(blank=True, null=True, help_text="Geographic coordinates with lat and lng")
    venue_types = models.ManyToManyField(
        "main.VenueType", blank=True, related_name="screen_managers", help_text="Venue types for this screen"
    )
    region = models.ForeignKey("main.Region", models.SET_NULL, "screen_managers", null=True, blank=True)
    district = models.ForeignKey(
        "main.District",
        models.SET_NULL,
        "screen_managers",
        null=True,
        blank=True,
        help_text="Specific district to target",
    )
    cpm = models.DecimalField(max_digits=12, decimal_places=2, default=30)
    interests = models.ManyToManyField("main.Interest", blank=True, related_name="screen_managers")
    status = models.CharField(choices=STATUS, default=INACTIVE)
    type_category = models.CharField(max_length=255)
    screen_size = models.CharField(max_length=255)
    screen_resolution = models.IntegerField()
    popular_times = models.JSONField(
        blank=True, null=True, help_text="Popular times data for foot traffic analysis"
    )

    class Meta(BaseModel.Meta):
        db_table = "main_screen_manager"
        verbose_name = "Screen Manager"
        verbose_name_plural = "Screen Managers"


class AdsManager(BaseModel):
    """
    Model for managing advertising campaigns with targeting and scheduling.
    """

    campaign_name = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    region = models.ForeignKey("main.Region", models.SET_NULL, "ads_managers", null=True, blank=True)
    district = models.ForeignKey(
        "main.District", models.SET_NULL, "ads_managers", null=True, blank=True, help_text="Specific district to target"
    )
    interests = models.ManyToManyField("main.Interest", blank=True, related_name="ads_managers")
    venue_types = models.ManyToManyField(
        "main.VenueType", blank=True, related_name="ads_managers", help_text="Venue types to target"
    )
    age_range = ArrayField(
        models.IntegerField(), size=2, blank=True, null=True, help_text="Age range [min_age, max_age]"
    )
    schedule = models.JSONField(default=dict, help_text="Schedule configuration with day-hour slots")
    meta_schedule_slots = models.IntegerField(default=0)
    meta_schedule_coverage = models.CharField(max_length=10, blank=True, null=True)
    meta_duration_days = models.IntegerField(default=0)

    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    DRAFT = "draft"
    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (PAUSED, "Paused"),
        (COMPLETED, "Completed"),
        (DRAFT, "Draft"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)

    class Meta(BaseModel.Meta):
        db_table = "main_ads_manager"
        verbose_name = "Ads Manager"
        verbose_name_plural = "Ads Managers"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.campaign_name} ({self.status})"

    def get_schedule_coverage_percentage(self):
        if self.meta_schedule_slots == 0:
            return 0
        total_slots = 7 * 24  # 7 days * 24 hours
        return round((self.meta_schedule_slots / total_slots) * 100, 1)

    def is_active(self):
        from django.utils import timezone

        now = timezone.now()
        return self.status == self.ACTIVE and self.start_date <= now <= self.end_date


class AdsManagerVideo(BaseModel):
    """
    Videos associated with advertising campaigns.
    """

    ads_manager = models.ForeignKey("main.AdsManager", models.CASCADE, "videos")
    video = models.FileField(upload_to="ads_videos/", max_length=255)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True, help_text="File size in bytes")

    class Meta(BaseModel.Meta):
        db_table = "main_ads_manager_video"
        verbose_name = "Ads Manager Video"
        verbose_name_plural = "Ads Manager Videos"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.ads_manager.campaign_name} - {self.title or 'Video'}"


class AdsManagerImage(BaseModel):
    """
    Images associated with advertising campaigns.
    """

    ads_manager = models.ForeignKey("main.AdsManager", models.CASCADE, "images")
    image = models.FileField(upload_to="ads_images/", max_length=255)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True, help_text="File size in bytes")
    width = models.IntegerField(blank=True, null=True, help_text="Image width in pixels")
    height = models.IntegerField(blank=True, null=True, help_text="Image height in pixels")

    class Meta(BaseModel.Meta):
        db_table = "main_ads_manager_image"
        verbose_name = "Ads Manager Image"
        verbose_name_plural = "Ads Manager Images"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.ads_manager.campaign_name} - {self.title or 'Image'}"


class VideoAnalytics(BaseModel):
    video = models.ForeignKey("main.AdsManagerVideo", models.CASCADE, "analytics")
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    referer = models.URLField(blank=True, null=True)
    watch_duration = models.DurationField(blank=True, null=True)
    is_complete = models.BooleanField(default=False)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)

    class Meta(BaseModel.Meta):
        db_table = "main_video_analytics"
        verbose_name = "Video Analytics"
        verbose_name_plural = "Video Analytics"
        ordering = ("-created_at",)
