# Django Admin Panel Documentation

## Overview

All models in the Street Screens project are now fully registered and customized in the Django admin panel with comprehensive features for easy management.

## Admin Site Customization

- **Site Header**: "Street Screens Administration"
- **Site Title**: "Street Screens Admin"
- **Index Title**: "Welcome to Street Screens Admin Panel"

## Registered Models

### 1. Region (`main.Region`)

**List Display:**
- Name
- Code
- District Count (calculated)
- Created At
- Updated At

**Features:**
- ✅ Search by name, code, description
- ✅ Filter by creation/update dates
- ✅ Date hierarchy by creation date
- ✅ Autocomplete enabled for foreign key references
- ✅ Shows count of districts in each region
- ✅ User tracking (created_by, updated_by)
- ✅ Organized fieldsets

---

### 2. District (`main.District`)

**List Display:**
- Name
- Region
- Code
- Created At

**Features:**
- ✅ Search by name, code, description, region name
- ✅ Filter by region, creation/update dates
- ✅ Autocomplete for region selection
- ✅ Date hierarchy
- ✅ User tracking
- ✅ Ordered by region and name

---

### 3. Interest (`main.Interest`)

**List Display:**
- Name
- Slug (auto-generated)
- Usage Count (shows usage in screens and ads)
- Created At

**Features:**
- ✅ Search by name, slug, description
- ✅ Auto-generated slug from name
- ✅ Shows combined usage count from Screen Managers and Ads Managers
- ✅ Read-only slug field
- ✅ User tracking

---

### 4. VenueType (`main.VenueType`)

**List Display:**
- Name
- Slug (auto-generated)
- Is Active (editable in list)
- Usage Count
- Created At

**Features:**
- ✅ Search by name, slug, description
- ✅ Filter by active status, dates
- ✅ Inline editing of "is_active" field
- ✅ Shows usage count across screens and ads
- ✅ Auto-generated slug

---

### 5. ScreenManager (`main.ScreenManager`)

**List Display:**
- Title
- Status Badge (colored indicator)
- Location
- Region
- District
- CPM
- Screen Size
- Created At

**Features:**
- ✅ Color-coded status badges (green=active, gray=inactive, orange=maintenance)
- ✅ Filter by status, region, district, venue types, dates
- ✅ Search by title, position, location, region, district
- ✅ Many-to-many widgets for venue types and interests
- ✅ Autocomplete for region and district
- ✅ Organized fieldsets: Basic Info, Location & Targeting, Screen Specs, Analytics, Metadata
- ✅ JSON field for popular times data
- ✅ 25 items per page

---

### 6. AdsManager (`main.AdsManager`)

**List Display:**
- Campaign Name
- Status Badge (colored)
- Budget Display (formatted with currency)
- Date Range (start → end)
- Region
- District
- Involve Count (QR scan counter)
- Has QR Code (✓/✗ indicator)
- Created At

**Features:**
- ✅ Color-coded status badges (green=active, orange=paused, blue=completed, gray=draft)
- ✅ QR Code preview in detail view
- ✅ Inline videos and images management
- ✅ Filter by status, currency, region, district, venue types, dates
- ✅ Many-to-many widgets for interests and venue types
- ✅ Schedule coverage percentage display
- ✅ Read-only fields for auto-generated data (involve_count, QR code, meta fields)
- ✅ Organized fieldsets: Campaign Details, Targeting, QR Code & Link, Schedule, Metadata
- ✅ Shows QR code download link
- ✅ Date hierarchy by start_date

**Inline Models:**
- AdsManagerVideo (tabular inline)
- AdsManagerImage (tabular inline)

---

### 7. AdsManagerVideo (`main.AdsManagerVideo`)

**List Display:**
- Title (or "Video #ID")
- Ads Manager
- Duration
- File Size (human-readable MB)
- View Count (from analytics)
- Created At

**Features:**
- ✅ Video preview in detail view (HTML5 player)
- ✅ Search by title, description, campaign name
- ✅ Filter by ads manager status, dates
- ✅ Automatic file size formatting
- ✅ Shows analytics count
- ✅ Raw ID fields for performance
- ✅ Read-only file metadata

---

### 8. AdsManagerImage (`main.AdsManagerImage`)

**List Display:**
- Title (or "Image #ID")
- Ads Manager
- Dimensions (width × height)
- File Size (KB/MB)
- Thumbnail (50×50px preview)
- Created At

**Features:**
- ✅ Full image preview in detail view
- ✅ Thumbnail in list view
- ✅ Search by title, description, campaign name
- ✅ Filter by ads manager status, dates
- ✅ Automatic dimension and file size display
- ✅ Human-readable file sizes
- ✅ Raw ID fields for performance

---

### 9. VideoAnalytics (`main.VideoAnalytics`)

**List Display:**
- Video
- IP Address
- Country
- City
- Is Complete
- Watch Duration
- Created At

**Features:**
- ✅ Search by IP, country, city, user agent, video title, campaign name
- ✅ Filter by completion status, country, city, date
- ✅ 50 items per page
- ✅ Date hierarchy
- ✅ **Add permission disabled** (analytics created by system only)
- ✅ Raw ID fields for performance

---

### 10. User (`users.User`)

**List Display:**
- Email
- First Name
- Last Name
- User Type Display (formatted)
- Phone
- Is Staff
- Is Active
- Date Joined

**Features:**
- ✅ Search by email, first name, last name, phone
- ✅ Filter by staff status, superuser, active, user type, groups, date joined
- ✅ Custom user creation form with password confirmation
- ✅ Formatted user type display
- ✅ Extended fieldsets including phone and additional_info
- ✅ 50 items per page
- ✅ Read-only date fields

---

## Key Features Across All Models

### 🎨 Visual Enhancements
- Color-coded status badges
- Image/video previews
- Thumbnail displays
- Formatted data display (file sizes, dates, currencies)

### 🔍 Search & Filter
- Comprehensive search fields
- Multiple filter options
- Date hierarchies for temporal navigation
- Autocomplete/raw_id_fields for foreign keys

### 📊 Data Display
- Calculated fields (usage counts, view counts, etc.)
- Human-readable formatting
- Relationship indicators
- Custom column methods

### 🔒 Security & Tracking
- User tracking (created_by, updated_by)
- Read-only auto-generated fields
- Permission controls
- System-only creation for analytics

### 📁 Organization
- Logical fieldset grouping
- Collapsible sections for metadata
- Inline editing for related models
- Many-to-many horizontal filters

### ⚡ Performance
- Raw ID fields for large datasets
- Autocomplete for searchable models
- Optimized queries
- Paginated list views

## Access URLs

- **Main Admin**: `/admin/`
- **Regions**: `/admin/main/region/`
- **Districts**: `/admin/main/district/`
- **Interests**: `/admin/main/interest/`
- **Venue Types**: `/admin/main/venuetype/`
- **Screen Managers**: `/admin/main/screenmanager/`
- **Ads Managers**: `/admin/main/adsmanager/`
- **Videos**: `/admin/main/adsmanagervideo/`
- **Images**: `/admin/main/adsmanagerimage/`
- **Analytics**: `/admin/main/videoanalytics/`
- **Users**: `/admin/users/user/`

## Admin Permissions

All models respect Django's built-in permissions system:
- `add_<model>` - Can add new records
- `change_<model>` - Can edit existing records
- `delete_<model>` - Can delete records
- `view_<model>` - Can view records

**Special Note**: VideoAnalytics has `add` permission disabled as records should only be created by the system.

## Best Practices

1. **Always use the search** - All models have comprehensive search configured
2. **Use filters** - Narrow down lists using the right sidebar filters
3. **Check metadata** - Expand collapsed metadata sections to see who created/updated records
4. **Preview before download** - Images and videos can be previewed directly in admin
5. **Use autocomplete** - Start typing in foreign key fields for quick selection
6. **Monitor analytics** - VideoAnalytics provides insights into video performance
7. **Track QR codes** - Check involve_count to see QR code engagement

## Common Tasks

### Create a New Ad Campaign
1. Go to Ads Managers → Add Ads Manager
2. Fill in campaign details, budget, dates
3. Select targeting (region, district, interests, venue types)
4. Add a link (QR code auto-generated)
5. Save
6. Add videos/images using the inline forms or separately

### Monitor Video Performance
1. Go to Video Analytics
2. Filter by video or date range
3. Check completion rates and watch duration
4. Export data as needed

### Manage Regions/Districts
1. Create regions first
2. Add districts linked to regions
3. Use these in Screen Managers and Ads Managers for targeting

### Track QR Code Engagement
1. Go to Ads Manager detail page
2. Check "involve_count" field
3. View QR code preview
4. Download QR code for use

## Troubleshooting

**Q: QR code not showing?**
- Ensure the ad has a link field filled
- QR codes are auto-generated when saving with a link

**Q: Can't find a record?**
- Use search functionality
- Check filters (might be filtering it out)
- Verify you have view permissions

**Q: Autocomplete not working?**
- Ensure the related model has search_fields configured
- Check that you're connected to the database

**Q: Video/Image not displaying?**
- Verify MEDIA_URL and MEDIA_ROOT settings
- Check file permissions
- Ensure media files are accessible

## Development Notes

- All admin classes include comprehensive docstrings
- Type hints used throughout for better IDE support
- Follows Django best practices
- Production-ready with proper error handling
- Extensible for future enhancements

