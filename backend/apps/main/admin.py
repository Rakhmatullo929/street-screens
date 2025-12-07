"""
Django Admin Configuration for Main App.

This module provides comprehensive admin interfaces for all models in the main app,
including proper list displays, filters, search capabilities, and custom features.
"""
from typing import Optional, Any
from django.contrib import admin
from django.db.models import QuerySet, Count
from django.http import HttpRequest
from django.utils.html import format_html
from django.utils.safestring import mark_safe

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


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """
    Admin interface for Region model.
    """
    list_display = ['name', 'code', 'district_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['name']
    date_hierarchy = 'created_at'
    
    # Enable autocomplete for this model
    def get_search_results(self, request, queryset, search_term):
        """Enable autocomplete search."""
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        return queryset, use_distinct
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def district_count(self, obj: Region) -> int:
        """Get number of districts in this region."""
        return obj.districts.count()
    
    district_count.short_description = 'Districts'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: Region, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    """
    Admin interface for District model.
    """
    list_display = ['name', 'region', 'code', 'created_at']
    list_filter = ['region', 'created_at', 'updated_at']
    search_fields = ['name', 'code', 'description', 'region__name']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['region__name', 'name']
    date_hierarchy = 'created_at'
    autocomplete_fields = ['region']
    
    # Enable autocomplete for this model
    def get_search_results(self, request, queryset, search_term):
        """Enable autocomplete search."""
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        return queryset, use_distinct
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'region', 'description')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request: HttpRequest, obj: District, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    """
    Admin interface for Interest model.
    """
    list_display = ['name', 'slug', 'usage_count', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'slug', 'description']
    readonly_fields = ['slug', 'created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['name']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def usage_count(self, obj: Interest) -> str:
        """Get combined usage count from screen managers and ads managers."""
        screen_count = obj.screen_managers.count()
        ads_count = obj.ads_managers.count()
        return f"{screen_count + ads_count} (Screens: {screen_count}, Ads: {ads_count})"
    
    usage_count.short_description = 'Usage'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: Interest, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(VenueType)
class VenueTypeAdmin(admin.ModelAdmin):
    """
    Admin interface for VenueType model.
    """
    list_display = ['name', 'slug', 'is_active', 'usage_count', 'created_at']
    list_filter = ['is_active', 'created_at', 'updated_at']
    search_fields = ['name', 'slug', 'description']
    readonly_fields = ['slug', 'created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['name']
    date_hierarchy = 'created_at'
    list_editable = ['is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def usage_count(self, obj: VenueType) -> str:
        """Get combined usage count from screen managers and ads managers."""
        screen_count = obj.screen_managers.count()
        ads_count = obj.ads_managers.count()
        return f"{screen_count + ads_count} (Screens: {screen_count}, Ads: {ads_count})"
    
    usage_count.short_description = 'Usage'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: VenueType, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ScreenManager)
class ScreenManagerAdmin(admin.ModelAdmin):
    """
    Admin interface for ScreenManager model.
    """
    list_display = [
        'title',
        'status_badge',
        'location',
        'region',
        'district',
        'cpm',
        'screen_size',
        'created_at'
    ]
    list_filter = ['status', 'region', 'district', 'venue_types', 'created_at', 'updated_at']
    search_fields = ['title', 'position', 'location', 'region__name', 'district__name']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    filter_horizontal = ['venue_types', 'interests']
    autocomplete_fields = ['region', 'district']
    list_per_page = 25
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'position', 'location', 'status')
        }),
        ('Location & Targeting', {
            'fields': ('region', 'district', 'coordinates', 'venue_types', 'interests')
        }),
        ('Screen Specifications', {
            'fields': ('type_category', 'screen_size', 'screen_resolution', 'cpm')
        }),
        ('Analytics', {
            'fields': ('popular_times',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj: ScreenManager) -> str:
        """Display status with color badge."""
        colors = {
            'active': 'green',
            'inactive': 'gray',
            'maintenance': 'orange'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Status'  # type: ignore
    status_badge.admin_order_field = 'status'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: ScreenManager, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


class AdsManagerVideoInline(admin.TabularInline):
    """
    Inline admin for AdsManagerVideo.
    """
    model = AdsManagerVideo
    extra = 0
    fields = ['video', 'title', 'duration', 'file_size', 'created_at']
    readonly_fields = ['file_size', 'created_at']
    can_delete = True
    show_change_link = True


class AdsManagerImageInline(admin.TabularInline):
    """
    Inline admin for AdsManagerImage.
    """
    model = AdsManagerImage
    extra = 0
    fields = ['image', 'title', 'width', 'height', 'file_size', 'created_at']
    readonly_fields = ['width', 'height', 'file_size', 'created_at']
    can_delete = True
    show_change_link = True


@admin.register(AdsManager)
class AdsManagerAdmin(admin.ModelAdmin):
    """
    Admin interface for AdsManager model.
    """
    list_display = [
        'campaign_name',
        'status_badge',
        'budget_display',
        'date_range',
        'region',
        'district',
        'involve_count',
        'has_qr_code',
        'created_at'
    ]
    list_filter = ['status', 'currency', 'region', 'district', 'venue_types', 'created_at', 'start_date']
    search_fields = ['campaign_name', 'region__name', 'district__name']
    readonly_fields = [
        'qr_code_preview',
        'involve_count',
        'meta_schedule_slots',
        'meta_schedule_coverage',
        'meta_duration_days',
        'schedule_coverage_display',
        'created_at',
        'updated_at',
        'created_by',
        'updated_by'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'start_date'
    filter_horizontal = ['interests', 'venue_types']
    autocomplete_fields = ['region', 'district']
    list_per_page = 25
    inlines = [AdsManagerVideoInline, AdsManagerImageInline]
    
    fieldsets = (
        ('Campaign Details', {
            'fields': ('campaign_name', 'status', 'budget', 'currency', 'start_date', 'end_date')
        }),
        ('Targeting', {
            'fields': ('region', 'district', 'interests', 'venue_types', 'age_range')
        }),
        ('QR Code & Link', {
            'fields': ('link', 'qr_code', 'qr_code_preview', 'involve_count'),
            'description': 'QR code is automatically generated when a link is provided'
        }),
        ('Schedule', {
            'fields': ('schedule', 'meta_schedule_slots', 'meta_schedule_coverage', 
                      'meta_duration_days', 'schedule_coverage_display'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj: AdsManager) -> str:
        """Display status with color badge."""
        colors = {
            'active': 'green',
            'paused': 'orange',
            'completed': 'blue',
            'draft': 'gray'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_status_display()
        )
    
    status_badge.short_description = 'Status'  # type: ignore
    status_badge.admin_order_field = 'status'  # type: ignore
    
    def budget_display(self, obj: AdsManager) -> str:
        """Format budget with currency."""
        return f"{obj.budget:,.2f} {obj.currency}"
    
    budget_display.short_description = 'Budget'  # type: ignore
    budget_display.admin_order_field = 'budget'  # type: ignore
    
    def date_range(self, obj: AdsManager) -> str:
        """Display campaign date range."""
        return f"{obj.start_date.strftime('%Y-%m-%d')} → {obj.end_date.strftime('%Y-%m-%d')}"
    
    date_range.short_description = 'Campaign Period'  # type: ignore
    
    def has_qr_code(self, obj: AdsManager) -> str:
        """Display if QR code exists."""
        if obj.qr_code:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: gray;">✗</span>')
    
    has_qr_code.short_description = 'QR'  # type: ignore
    
    def qr_code_preview(self, obj: AdsManager) -> str:
        """Display QR code preview in admin."""
        if obj.qr_code:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px;" />'
                '<br><a href="{}" target="_blank">Download QR Code</a>',
                obj.qr_code.url,
                obj.qr_code.url
            )
        return "No QR code generated"
    
    qr_code_preview.short_description = 'QR Code Preview'  # type: ignore
    
    def schedule_coverage_display(self, obj: AdsManager) -> str:
        """Display schedule coverage percentage."""
        percentage = obj.get_schedule_coverage_percentage()
        return f"{percentage}%"
    
    schedule_coverage_display.short_description = 'Schedule Coverage'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: AdsManager, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(AdsManagerVideo)
class AdsManagerVideoAdmin(admin.ModelAdmin):
    """
    Admin interface for AdsManagerVideo model.
    """
    list_display = [
        'title_display',
        'ads_manager',
        'duration',
        'file_size_display',
        'view_count',
        'created_at'
    ]
    list_filter = ['ads_manager__status', 'created_at', 'updated_at']
    search_fields = ['title', 'description', 'ads_manager__campaign_name']
    readonly_fields = ['file_size', 'video_preview', 'created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 25
    
    # Enable raw_id_fields instead of autocomplete for better performance
    raw_id_fields = ['ads_manager']
    
    fieldsets = (
        ('Video Information', {
            'fields': ('ads_manager', 'video', 'video_preview', 'title', 'description')
        }),
        ('File Details', {
            'fields': ('duration', 'file_size'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def title_display(self, obj: AdsManagerVideo) -> str:
        """Display title or default text."""
        return obj.title or f"Video #{obj.id}"
    
    title_display.short_description = 'Title'  # type: ignore
    
    def file_size_display(self, obj: AdsManagerVideo) -> str:
        """Display file size in human-readable format."""
        if obj.file_size:
            size_mb = obj.file_size / (1024 * 1024)
            return f"{size_mb:.2f} MB"
        return "N/A"
    
    file_size_display.short_description = 'File Size'  # type: ignore
    file_size_display.admin_order_field = 'file_size'  # type: ignore
    
    def view_count(self, obj: AdsManagerVideo) -> int:
        """Get number of analytics records (views)."""
        return obj.analytics.count()
    
    view_count.short_description = 'Views'  # type: ignore
    
    def video_preview(self, obj: AdsManagerVideo) -> str:
        """Display video preview in admin."""
        if obj.video:
            return format_html(
                '<video width="320" height="240" controls>'
                '<source src="{}" type="video/mp4">'
                'Your browser does not support the video tag.'
                '</video>',
                obj.video.url
            )
        return "No video uploaded"
    
    video_preview.short_description = 'Video Preview'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: AdsManagerVideo, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(AdsManagerImage)
class AdsManagerImageAdmin(admin.ModelAdmin):
    """
    Admin interface for AdsManagerImage model.
    """
    list_display = [
        'title_display',
        'ads_manager',
        'dimensions',
        'file_size_display',
        'image_thumbnail',
        'created_at'
    ]
    list_filter = ['ads_manager__status', 'created_at', 'updated_at']
    search_fields = ['title', 'description', 'ads_manager__campaign_name']
    readonly_fields = ['width', 'height', 'file_size', 'image_preview', 'created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 25
    
    # Enable raw_id_fields instead of autocomplete for better performance
    raw_id_fields = ['ads_manager']
    
    fieldsets = (
        ('Image Information', {
            'fields': ('ads_manager', 'image', 'image_preview', 'title', 'description')
        }),
        ('File Details', {
            'fields': ('width', 'height', 'file_size'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def title_display(self, obj: AdsManagerImage) -> str:
        """Display title or default text."""
        return obj.title or f"Image #{obj.id}"
    
    title_display.short_description = 'Title'  # type: ignore
    
    def dimensions(self, obj: AdsManagerImage) -> str:
        """Display image dimensions."""
        if obj.width and obj.height:
            return f"{obj.width} × {obj.height}"
        return "N/A"
    
    dimensions.short_description = 'Dimensions'  # type: ignore
    
    def file_size_display(self, obj: AdsManagerImage) -> str:
        """Display file size in human-readable format."""
        if obj.file_size:
            if obj.file_size > 1024 * 1024:
                size_mb = obj.file_size / (1024 * 1024)
                return f"{size_mb:.2f} MB"
            else:
                size_kb = obj.file_size / 1024
                return f"{size_kb:.2f} KB"
        return "N/A"
    
    file_size_display.short_description = 'File Size'  # type: ignore
    file_size_display.admin_order_field = 'file_size'  # type: ignore
    
    def image_thumbnail(self, obj: AdsManagerImage) -> str:
        """Display small thumbnail in list view."""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.image.url
            )
        return "No image"
    
    image_thumbnail.short_description = 'Thumbnail'  # type: ignore
    
    def image_preview(self, obj: AdsManagerImage) -> str:
        """Display image preview in admin."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; max-height: 500px;" />',
                obj.image.url
            )
        return "No image uploaded"
    
    image_preview.short_description = 'Image Preview'  # type: ignore
    
    def save_model(self, request: HttpRequest, obj: AdsManagerImage, form: Any, change: bool) -> None:
        """Save model with user tracking."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(VideoAnalytics)
class VideoAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin interface for VideoAnalytics model.
    """
    list_display = [
        'video',
        'ip_address',
        'country',
        'city',
        'is_complete',
        'watch_duration',
        'created_at'
    ]
    list_filter = ['is_complete', 'country', 'city', 'created_at']
    search_fields = ['ip_address', 'country', 'city', 'user_agent', 'video__title', 'video__ads_manager__campaign_name']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    # Enable raw_id_fields for better performance
    raw_id_fields = ['video']
    
    fieldsets = (
        ('Video & Viewer', {
            'fields': ('video', 'ip_address', 'user_agent')
        }),
        ('Location', {
            'fields': ('country', 'city')
        }),
        ('Engagement', {
            'fields': ('watch_duration', 'is_complete', 'referer')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request: HttpRequest) -> bool:
        """Disable manual creation of analytics (should be created by system)."""
        return False


# Customize admin site header and title
admin.site.site_header = "Street Screens Administration"
admin.site.site_title = "Street Screens Admin"
admin.site.index_title = "Welcome to Street Screens Admin Panel"
