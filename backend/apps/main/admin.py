from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Region,
    District,
    Interest,
    VenueType,
    ScreenManager,
    AdsManager,
    AdsManagerVideo,
    AdsManagerImage,
    VideoAnalytics,
)


class AdsManagerVideoInline(admin.TabularInline):
    model = AdsManagerVideo
    extra = 0
    readonly_fields = ("duration", "file_size", "created_at")
    fields = ("video", "title", "description", "duration", "file_size", "created_at")


class AdsManagerImageInline(admin.TabularInline):
    model = AdsManagerImage
    extra = 0
    readonly_fields = ("file_size", "width", "height", "created_at")
    fields = ("image", "title", "description", "file_size", "width", "height", "created_at")


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "created_at")
    search_fields = ("name", "code")
    ordering = ("name",)


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "code")
    search_fields = ("name", "region__name")
    list_filter = ("region",)
    ordering = ("region", "name")


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    readonly_fields = ("slug",)
    ordering = ("name",)


@admin.register(VenueType)
class VenueTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    readonly_fields = ("slug",)
    ordering = ("name",)


@admin.register(ScreenManager)
class ScreenManagerAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "region", "district", "cpm")
    list_filter = ("status", "region", "district", "venue_types", "interests")
    search_fields = ("title", "position", "location")
    filter_horizontal = ("venue_types", "interests")

    fieldsets = (
        ("📌 Основная информация", {
            "fields": ("title", "position", "location", "status", "type_category")
        }),
        ("📍 Локация", {
            "fields": ("region", "district", "coordinates")
        }),
        ("🏢 Venue & Interest Targeting", {
            "fields": ("venue_types", "interests")
        }),
        ("🖥 Экран", {
            "fields": ("screen_size", "screen_resolution")
        }),
        ("💰 Стоимость", {
            "fields": ("cpm",)
        }),
        ("📊 Аналитика", {
            "fields": ("popular_times",)
        }),
        ("⏱ Системные поля", {
            "fields": ("created_at", "updated_at", "created_by", "updated_by"),
            "classes": ("collapse",),
        }),
    )

    readonly_fields = ("created_at", "updated_at")


@admin.register(AdsManager)
class AdsManagerAdmin(admin.ModelAdmin):
    list_display = ("campaign_name", "status", "budget", "currency", "start_date", "end_date", "coverage_badge")
    list_filter = ("status", "region", "district", "venue_types", "interests")
    search_fields = ("campaign_name",)
    filter_horizontal = ("venue_types", "interests")
    inlines = [AdsManagerVideoInline, AdsManagerImageInline]

    fieldsets = (
        ("📌 Кампания", {
            "fields": ("campaign_name", "status", "link")
        }),
        ("💰 Бюджет", {
            "fields": ("budget", "currency")
        }),
        ("📅 Даты", {
            "fields": ("start_date", "end_date")
        }),
        ("📍 Локация", {
            "fields": ("region", "district")
        }),
        ("🎯 Таргетинг", {
            "fields": ("venue_types", "interests", "age_range")
        }),
        ("🗓 Расписание", {
            "fields": ("schedule", "meta_schedule_slots", "meta_schedule_coverage", "meta_duration_days"),
        }),
        ("🔧 Системные поля", {
            "fields": ("created_at", "updated_at", "created_by", "updated_by"),
            "classes": ("collapse",),
        }),
    )

    readonly_fields = ("created_at", "updated_at")

    def coverage_badge(self, obj):
        value = obj.meta_schedule_coverage

        if not value:
            return "-"

        cleaned = str(value).replace("%", "").strip()

        try:
            num = float(cleaned)
        except ValueError:
            return value

        color = "green" if num > 50 else "orange"

        return format_html(
            '<span style="padding:4px 8px; border-radius:6px; background:{}; color:white;">{}%</span>',
            color, num
        )


@admin.register(VideoAnalytics)
class VideoAnalyticsAdmin(admin.ModelAdmin):
    list_display = ("video", "ip_address", "country", "city", "watch_duration", "is_complete", "created_at")
    search_fields = ("ip_address", "country", "city", "video__ads_manager__campaign_name")
    list_filter = ("is_complete", "country", "city")
