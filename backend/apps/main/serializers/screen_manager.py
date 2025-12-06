from typing import Any, Dict
from rest_framework import serializers

from apps.main.serializers.regions import RegionSerializer, DistrictSerializer
from apps.main.serializers.interest import InterestSerializer
from apps.main.serializers.venue_type import VenueTypeSerializer
from main.models import ScreenManager, AdsManager, AdsManagerVideo, AdsManagerImage, Region, District, Interest, VenueType


class ScreenManagerSerializer(serializers.ModelSerializer):
    """
    Serializer for ScreenManager model.
    Handles screen manager data with region, district, and venue types.
    """
    region_id = serializers.IntegerField(write_only=True, required=False)
    district_id = serializers.IntegerField(write_only=True, required=False)
    venue_type_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    region = RegionSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    venue_types = VenueTypeSerializer(many=True, read_only=True)

    class Meta:
        model = ScreenManager
        fields = [
            "id",
            "title",
            "position",
            "location",
            "coordinates",
            "region",
            "region_id",
            "district",
            "district_id",
            "venue_types",
            "venue_type_ids",
            "status",
            "type_category",
            "screen_size",
            "screen_resolution",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "updated_by"]

    def create(self, validated_data: Dict[str, Any]) -> ScreenManager:
        """
        Create screen manager with region, district, and venue types validation.
        """
        region_id = validated_data.pop('region_id', None)
        district_id = validated_data.pop('district_id', None)
        venue_type_ids = validated_data.pop('venue_type_ids', [])
        
        if region_id:
            try:
                validated_data['region'] = Region.objects.get(id=region_id)
            except Region.DoesNotExist:
                raise serializers.ValidationError({'region_id': 'Invalid region ID'})
        
        # Validate district ID
        if district_id:
            try:
                validated_data['district'] = District.objects.get(id=district_id)
            except District.DoesNotExist:
                raise serializers.ValidationError({'district_id': 'Invalid district ID'})
        
        # Validate venue type IDs
        if venue_type_ids:
            try:
                venue_types = VenueType.objects.filter(id__in=venue_type_ids)
                if len(venue_types) != len(venue_type_ids):
                    invalid_ids = set(venue_type_ids) - set(venue_types.values_list('id', flat=True))
                    raise serializers.ValidationError({'venue_type_ids': f'Invalid venue type IDs: {list(invalid_ids)}'})
            except Exception as e:
                raise serializers.ValidationError({'venue_type_ids': str(e)})
        
        validated_data["created_by"] = self.context["request"].user
        instance = super().create(validated_data)
        
        # Set venue types after creation
        if venue_type_ids:
            instance.venue_types.set(venue_type_ids)
        
        return instance

    def update(self, instance: ScreenManager, validated_data: Dict[str, Any]) -> ScreenManager:
        """
        Update screen manager with region, district, and venue types validation.
        """
        region_id = validated_data.pop('region_id', None)
        district_id = validated_data.pop('district_id', None)
        venue_type_ids = validated_data.pop('venue_type_ids', None)
        
        if region_id is not None:
            if region_id:
                try:
                    validated_data['region'] = Region.objects.get(id=region_id)
                except Region.DoesNotExist:
                    raise serializers.ValidationError({'region_id': 'Invalid region ID'})
            else:
                validated_data['region'] = None
        
        # Validate district ID
        if district_id is not None:
            if district_id:
                try:
                    validated_data['district'] = District.objects.get(id=district_id)
                except District.DoesNotExist:
                    raise serializers.ValidationError({'district_id': 'Invalid district ID'})
            else:
                validated_data['district'] = None
        
        # Validate venue type IDs
        if venue_type_ids is not None:
            if venue_type_ids:
                try:
                    venue_types = VenueType.objects.filter(id__in=venue_type_ids)
                    if len(venue_types) != len(venue_type_ids):
                        invalid_ids = set(venue_type_ids) - set(venue_types.values_list('id', flat=True))
                        raise serializers.ValidationError({'venue_type_ids': f'Invalid venue type IDs: {list(invalid_ids)}'})
                except Exception as e:
                    raise serializers.ValidationError({'venue_type_ids': str(e)})
        
        validated_data["updated_by"] = self.context["request"].user
        instance = super().update(instance, validated_data)
        
        # Update venue types if provided
        if venue_type_ids is not None:
            if venue_type_ids:
                instance.venue_types.set(venue_type_ids)
            else:
                instance.venue_types.clear()
        
        return instance


class AdsManagerSerializer(serializers.ModelSerializer):
    """
    Serializer for AdsManager model.
    Handles ads campaign data with region, district, interests, venue types, and content files.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    schedule_coverage_percentage = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    region_id = serializers.IntegerField(write_only=True, required=False)
    district_id = serializers.IntegerField(write_only=True, required=False)
    interest_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    venue_type_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    # Content fields for video/image upload
    content_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    content_type = serializers.ChoiceField(
        choices=[('video', 'Video'), ('image', 'Image')],
        write_only=True,
        required=False
    )
    display_duration = serializers.ChoiceField(
        choices=[(5, '5 seconds'), (10, '10 seconds'), (15, '15 seconds')],
        write_only=True,
        required=False
    )
    region = RegionSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    interests = InterestSerializer(many=True, read_only=True)
    venue_types = VenueTypeSerializer(many=True, read_only=True)
    videos = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = AdsManager
        fields = [
            "id",
            "campaign_name",
            "budget",
            "currency",
            "start_date",
            "end_date",
            "region",
            "region_id",
            "district",
            "district_id",
            "interests",
            "interest_ids",
            "venue_types",
            "venue_type_ids",
            "schedule",
            "meta_schedule_slots",
            "meta_schedule_coverage",
            "meta_duration_days",
            "status",
            "status_display",
            "schedule_coverage_percentage",
            "is_active",
            "content_files",
            "content_type",
            "display_duration",
            "videos",
            "images",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "updated_by"]
    
    def get_schedule_coverage_percentage(self, obj):
        """
        Get schedule coverage percentage for the ads manager.
        """
        return obj.get_schedule_coverage_percentage()
    
    def get_is_active(self, obj):
        """
        Check if ads manager is currently active.
        """
        return obj.is_active()
    
    def get_videos(self, obj):
        """
        Get list of videos associated with the ads manager.
        """
        return [
            {
                'id': video.id,
                'video': video.video.url if video.video else None,
                'title': video.title,
                'description': video.description,
                'file_size': video.file_size,
                'created_at': video.created_at,
            }
            for video in obj.videos.all()
        ]
    
    def get_images(self, obj):
        """
        Get list of images associated with the ads manager.
        """
        return [
            {
                'id': image.id,
                'image': image.image.url if image.image else None,
                'title': image.title,
                'description': image.description,
                'file_size': image.file_size,
                'width': image.width,
                'height': image.height,
                'created_at': image.created_at,
            }
            for image in obj.images.all()
        ]
    
    def create(self, validated_data: Dict[str, Any]) -> AdsManager:
        """
        Create ads manager with region, district, interests, venue types, and content files.
        """
        region_id = validated_data.pop('region_id', None)
        district_id = validated_data.pop('district_id', None)
        interest_ids = validated_data.pop('interest_ids', [])
        venue_type_ids = validated_data.pop('venue_type_ids', [])
        
        # Extract content files and metadata
        content_files = validated_data.pop('content_files', [])
        content_type = validated_data.pop('content_type', None)
        display_duration = validated_data.pop('display_duration', None)
        
        if region_id:
            try:
                validated_data['region'] = Region.objects.get(id=region_id)
            except Region.DoesNotExist:
                raise serializers.ValidationError({'region_id': 'Invalid region ID'})
        
        # Validate district ID
        if district_id:
            try:
                district = District.objects.get(id=district_id)
                validated_data['district'] = district
            except District.DoesNotExist:
                raise serializers.ValidationError({'district_id': 'Invalid district ID'})
        
        # Validate interest IDs
        if interest_ids:
            try:
                interests = Interest.objects.filter(id__in=interest_ids)
                if len(interests) != len(interest_ids):
                    invalid_ids = set(interest_ids) - set(interests.values_list('id', flat=True))
                    raise serializers.ValidationError({'interest_ids': f'Invalid interest IDs: {list(invalid_ids)}'})
            except Exception as e:
                raise serializers.ValidationError({'interest_ids': str(e)})
        
        # Validate venue type IDs
        if venue_type_ids:
            try:
                venue_types = VenueType.objects.filter(id__in=venue_type_ids)
                if len(venue_types) != len(venue_type_ids):
                    invalid_ids = set(venue_type_ids) - set(venue_types.values_list('id', flat=True))
                    raise serializers.ValidationError({'venue_type_ids': f'Invalid venue type IDs: {list(invalid_ids)}'})
            except Exception as e:
                raise serializers.ValidationError({'venue_type_ids': str(e)})
        
        validated_data["created_by"] = self.context["request"].user
        instance = super().create(validated_data)
        
        # Set interests and venue types after creation
        if interest_ids:
            instance.interests.set(interest_ids)
        if venue_type_ids:
            instance.venue_types.set(venue_type_ids)
        
        # Handle content files if provided
        if content_files:
            if content_type == 'video':
                for file in content_files:
                    AdsManagerVideo.objects.create(
                        ads_manager=instance,
                        video=file,
                        created_by=self.context["request"].user
                    )
            elif content_type == 'image':
                for file in content_files:
                    AdsManagerImage.objects.create(
                        ads_manager=instance,
                        image=file,
                        created_by=self.context["request"].user
                    )
        
        return instance
    
    def update(self, instance: AdsManager, validated_data: Dict[str, Any]) -> AdsManager:
        """
        Update ads manager with region, district, interests, venue types, and content files.
        """
        region_id = validated_data.pop('region_id', None)
        district_id = validated_data.pop('district_id', None)
        interest_ids = validated_data.pop('interest_ids', None)
        venue_type_ids = validated_data.pop('venue_type_ids', None)
        
        # Extract content files and metadata
        content_files = validated_data.pop('content_files', None)
        content_type = validated_data.pop('content_type', None)
        display_duration = validated_data.pop('display_duration', None)
        
        if region_id is not None:
            if region_id:
                try:
                    validated_data['region'] = Region.objects.get(id=region_id)
                except Region.DoesNotExist:
                    raise serializers.ValidationError({'region_id': 'Invalid region ID'})
            else:
                validated_data['region'] = None
        
        # Validate district ID
        if district_id is not None:
            if district_id:
                try:
                    validated_data['district'] = District.objects.get(id=district_id)
                except District.DoesNotExist:
                    raise serializers.ValidationError({'district_id': 'Invalid district ID'})
            else:
                validated_data['district'] = None
        
        # Validate interest IDs
        if interest_ids is not None:
            if interest_ids:
                try:
                    interests = Interest.objects.filter(id__in=interest_ids)
                    if len(interests) != len(interest_ids):
                        invalid_ids = set(interest_ids) - set(interests.values_list('id', flat=True))
                        raise serializers.ValidationError({'interest_ids': f'Invalid interest IDs: {list(invalid_ids)}'})
                except Exception as e:
                    raise serializers.ValidationError({'interest_ids': str(e)})
        
        # Validate venue type IDs
        if venue_type_ids is not None:
            if venue_type_ids:
                try:
                    venue_types = VenueType.objects.filter(id__in=venue_type_ids)
                    if len(venue_types) != len(venue_type_ids):
                        invalid_ids = set(venue_type_ids) - set(venue_types.values_list('id', flat=True))
                        raise serializers.ValidationError({'venue_type_ids': f'Invalid venue type IDs: {list(invalid_ids)}'})
                except Exception as e:
                    raise serializers.ValidationError({'venue_type_ids': str(e)})
        
        validated_data["updated_by"] = self.context["request"].user
        instance = super().update(instance, validated_data)
        
        # Update interests and venue types if provided (district is handled above)
        if interest_ids is not None:
            if interest_ids:
                instance.interests.set(interest_ids)
            else:
                instance.interests.clear()
        
        if venue_type_ids is not None:
            if venue_type_ids:
                instance.venue_types.set(venue_type_ids)
            else:
                instance.venue_types.clear()
        
        # Handle content files if provided
        if content_files is not None:
            # Clear existing content and add new ones
            if content_type == 'video':
                instance.videos.all().delete()
                for file in content_files:
                    AdsManagerVideo.objects.create(
                        ads_manager=instance,
                        video=file,
                        created_by=self.context["request"].user
                    )
            elif content_type == 'image':
                instance.images.all().delete()
                for file in content_files:
                    AdsManagerImage.objects.create(
                        ads_manager=instance,
                        image=file,
                        created_by=self.context["request"].user
                    )
        
        return instance


class AdsManagerVideoSerializer(serializers.ModelSerializer):
    """
    Serializer for AdsManagerVideo model.
    Handles video data for ads campaigns.
    """
    ads_manager_name = serializers.CharField(source='ads_manager.campaign_name', read_only=True)
    ads_manager_status = serializers.CharField(source='ads_manager.status', read_only=True)
    video_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AdsManagerVideo
        fields = [
            "id",
            "ads_manager",
            "ads_manager_name",
            "ads_manager_status",
            "video",
            "video_url",
            "title",
            "description",
            "duration",
            "file_size",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "updated_by", "file_size"]
    
    def get_video_url(self, obj):
        """Get the URL for serving the video."""
        if obj.video:
            return f"/api/v1/main/ads-videos/{obj.id}/serve/"
        return None
    
    def create(self, validated_data: Dict[str, Any]) -> AdsManagerVideo:
        """
        Create video and set created_by to current user.
        """
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
    
    def update(self, instance: AdsManagerVideo, validated_data: Dict[str, Any]) -> AdsManagerVideo:
        """
        Update video and set updated_by to current user.
        """
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)


class AdsManagerImageSerializer(serializers.ModelSerializer):
    """
    Serializer for AdsManagerImage model.
    Handles image data for ads campaigns.
    """
    ads_manager_name = serializers.CharField(source='ads_manager.campaign_name', read_only=True)
    ads_manager_status = serializers.CharField(source='ads_manager.status', read_only=True)
    
    class Meta:
        model = AdsManagerImage
        fields = [
            "id",
            "ads_manager",
            "ads_manager_name",
            "ads_manager_status",
            "image",
            "title",
            "description",
            "file_size",
            "width",
            "height",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "updated_by", "file_size", "width", "height"]
    
    def create(self, validated_data: Dict[str, Any]) -> AdsManagerImage:
        """
        Create image and set created_by to current user.
        """
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
    
    def update(self, instance: AdsManagerImage, validated_data: Dict[str, Any]) -> AdsManagerImage:
        """
        Update image and set updated_by to current user.
        """
        validated_data["updated_by"] = self.context["request"].user
        return super().update(instance, validated_data)



class SummarySerializer(serializers.ModelSerializer):
    """
    Serializer for ads manager summary/efficiency forecast request.
    Validates filter parameters for summary calculation.
    """
    interests = serializers.PrimaryKeyRelatedField(queryset=Interest.objects.all(), many=True)

    class Meta:
        model = AdsManager
        fields = ["district", "region", 'venue_types', 'interests']
