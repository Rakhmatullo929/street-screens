import { useMemo, useCallback, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';

import {
    Card,
    Stack,
    Button,
    Box,
    Grid,
    TextField,
    InputAdornment,
    MenuItem,
    Alert,
    Typography,
    Slider,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
    RHFTextField,
    RHFAutocomplete,
    RHFUpload,
} from 'src/components/hook-form';
import { CustomFile } from 'src/components/upload/types';
import WeeklyScheduleCalendar, { WeeklySchedule } from 'src/components/schedule/weekly-schedule-calendar';
import RegionDistrictSelect from 'src/components/region-district-select';

import { useRegionDistrictOptions } from 'src/hooks/use-regions';
import { useApiMutation } from 'src/hooks/use-api-mutation';
import { useApiQuery } from 'src/hooks/use-api-query';

import {
    DISPLAY_DURATION_OPTIONS,
    CONTENT_TYPE_OPTIONS,
    convertBackendScheduleToCalendar
} from 'src/constants/dooh-data';

import type { IAdsManager, IAdsManagerCreateUpdate } from 'src/types/ads-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

import { HOST_API } from 'src/config-global';

const INTERESTS = [
    'Technology',
    'Sports',
    'Fashion',
    'Travel',
    'Food & Restaurants',
    'Automotive',
    'Real Estate',
    'Finance',
    'Education',
    'Health & Fitness',
    'Entertainment',
    'Music',
    'Books',
    'Arts',
    'Business',
];

const CURRENCIES = [
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'UZS', label: 'UZS', symbol: 'UZS' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
];

const VENUE_TYPES = [
    { id: 'shopping', label: 'Shopping Centers', icon: 'solar:shop-2-bold-duotone' },
    { id: 'street', label: 'Streets & Roads', icon: 'solar:streets-bold-duotone' },
    { id: 'transport', label: 'Transport', icon: 'solar:bus-bold-duotone' },
    { id: 'office', label: 'Office Buildings', icon: 'solar:buildings-2-bold-duotone' },
    { id: 'sports', label: 'Sports Facilities', icon: 'solar:football-bold-duotone' },
    { id: 'entertainment', label: 'Entertainment Centers', icon: 'solar:star-bold-duotone' },
];

interface FormValues {
    campaignName: string;
    link: string;
    budget: number;
    currency: string;
    startDate: Date;
    endDate: Date;
    geoTarget: {
        region: number | null;
        district: number | null;
    };
    interests: string[];
    venueTypes: number[];
    ageRange: [number, number];
    schedule: WeeklySchedule;

    displayDuration?: 5 | 10 | 15;
    contentType?: 'video' | 'image';
    contentFiles?: File[];
}

interface CampaignNewEditFormProps {
    currentCampaign?: IAdsManager;
    isEdit?: boolean;
}

const getMediaUrl = (mediaPath: string | null) => {
    if (!mediaPath || !HOST_API) return '';

    // If already a full URL, return as is
    if (mediaPath.startsWith('http')) return mediaPath;


    const cleanPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
    return `${HOST_API}${cleanPath}`;
};

export default function CampaignNewEditForm({
    currentCampaign,
    isEdit = false,
}: CampaignNewEditFormProps) {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();


    const [isCalendarOpen, setIsCalendarOpen] = useState(false);


    const CampaignSchema = useMemo(() => {

        const hasExistingVideos = currentCampaign?.videos && currentCampaign.videos.length > 0;
        const hasExistingImages = currentCampaign?.images && currentCampaign.images.length > 0;

        return Yup.object().shape({
            campaignName: Yup.string().required('Campaign name is required'),
            link: Yup.string().url('Enter a valid URL').nullable(),
            budget: Yup.number()
                .required('Budget is required')
                .min(100, 'Minimum budget is 100')
                .max(1000000, 'Maximum budget is 1,000,000'),
            currency: Yup.string().required('Currency is required'),
            startDate: Yup.date().nullable().required('Start date is required'),
            endDate: Yup.date()
                .nullable()
                .required('End date is required')
                .min(Yup.ref('startDate'), 'End date must be after start date'),
            geoTarget: Yup.object().shape({
                region: Yup.number().nullable().required('Select region'),
                district: Yup.number().nullable().required('Select district'),
            }),
            interests: Yup.array().min(1, 'Select at least one interest'),
            venueTypes: Yup.array(),
            schedule: Yup.object().test(
                'has-schedule',
                'Select at least one time slot for ad display',
                (value) => {
                    if (!value) return false;
                    return Object.values(value).some(Boolean);
                }
            ),
            displayDuration: Yup.number().oneOf([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], 'Select display time on monitor'),
            contentType: Yup.string().oneOf(['video', 'image'], 'Select content type'),
            contentFiles: Yup.array().test('content-files-required', (value, { parent, createError }) => {
                const { contentType } = parent;

                if (contentType === 'video' || contentType === 'image') {

                    const hasNewFiles = value && value.length > 0;
                    const hasExistingContent = contentType === 'video' ? hasExistingVideos : hasExistingImages;


                    if (!hasNewFiles && !hasExistingContent) {
                        return createError({ message: `Upload ${contentType === 'video' ? 'video' : 'image'}` });
                    }
                }

                return true;
            }),
        });
    }, [currentCampaign]);

    const defaultValues = useMemo(
        () => ({
            campaignName: currentCampaign?.campaign_name || '',
            link: currentCampaign?.link || '',
            budget: currentCampaign?.budget || 1000,
            currency: currentCampaign?.currency || 'USD',
            startDate: currentCampaign?.start_date ? new Date(currentCampaign.start_date) : new Date(),
            endDate: currentCampaign?.end_date
                ? new Date(currentCampaign.end_date)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            geoTarget: {
                region: currentCampaign?.region?.id || null,
                district: currentCampaign?.district?.id || null,
            },
            interests: currentCampaign?.interests?.map(interest => interest.name) || [],
            venueTypes: currentCampaign?.venue_types?.map(venue => venue.id) || [],
            ageRange: [18, 65] as [number, number],
            schedule: convertBackendScheduleToCalendar(currentCampaign?.schedule),
            displayDuration: 15 as const,
            contentType: 'video' as const,
            contentFiles: [],
        }),
        [currentCampaign]
    );

    const methods = useForm<FormValues>({
        resolver: yupResolver(CampaignSchema) as any,
        defaultValues,
    });

    const {
        watch,
        control,
        setValue,
        reset,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = methods;

    const values = watch();


    const hasExistingVideos = currentCampaign?.videos && currentCampaign.videos.length > 0;
    const hasExistingImages = currentCampaign?.images && currentCampaign.images.length > 0;
    const hasNewFiles = values.contentFiles && values.contentFiles.length > 0;


    const hasRelevantContent = values.contentType === 'video'
        ? (hasNewFiles || hasExistingVideos)
        : (hasNewFiles || hasExistingImages);

    const hasAnyContent = hasNewFiles || hasExistingVideos || hasExistingImages;


    const shouldShowExistingVideo = values.contentType === 'video' && hasExistingVideos && currentCampaign?.videos?.[0] && !hasNewFiles;
    const shouldShowNewVideo = values.contentType === 'video' && hasNewFiles && values.contentFiles?.[0];


    const shouldShowExistingImages = values.contentType === 'image' && hasExistingImages && currentCampaign?.images && currentCampaign.images.length > 0 && !hasNewFiles;
    const shouldShowNewImages = values.contentType === 'image' && hasNewFiles && values.contentFiles && values.contentFiles.length > 0;


    useEffect(() => {
        setValue('contentType', 'video');
    }, [setValue]);


    useEffect(() => {
        reset(defaultValues);
    }, [reset, defaultValues]);


    useEffect(() => {
        if (currentCampaign) {
            const scheduleValue = convertBackendScheduleToCalendar(currentCampaign.schedule);
            setValue('schedule', scheduleValue, { shouldDirty: false, shouldTouch: false });
        }
    }, [currentCampaign, setValue]);


    const { regions, districts } = useRegionDistrictOptions(values.geoTarget.region);


    const { data: interestsData } = useApiQuery<Array<{ id: number; name: string; slug: string }>>({
        url: API_ENDPOINTS.interest.list,
    });


    const { data: venueTypesData } = useApiQuery<Array<{ id: number; name: string; slug: string; is_active: boolean }>>({
        url: API_ENDPOINTS.venueType.list,
        params: {
            lang: 'uz',
            is_active: true,
        },
    });


    const availableInterests = useMemo(() =>
        interestsData?.map(interest => interest.name) || [],
        [interestsData]
    );

    const availableVenueTypes = useMemo(() =>
        venueTypesData?.filter(vt => vt.is_active) || [],
        [venueTypesData]
    );


    const interestIds = useMemo(() =>
        values.interests
            .map(interestName => interestsData?.find(interest => interest.name === interestName)?.id)
            .filter(id => id !== undefined) as number[],
        [values.interests, interestsData]
    );

    const summary = useApiQuery({
        url: API_ENDPOINTS.adsManager.summary,
        method: 'GET',
        enabled: true,
        params: {
            district: values.geoTarget.district,
            region: values.geoTarget.region,
            venue_types: values.venueTypes,
            interests: interestIds,
        },
    });


    const forecast = useMemo(() => {
        const cpm = summary.data?.cpm || 0;
        const impressions = Math.floor((values.budget / cpm) * 1000);
        const screens = summary.data?.screens_count || 0;

        return {
            cpm: cpm.toFixed(2),
            impressions: impressions.toLocaleString(),
            screens,
        };
    }, [values.budget, summary.data?.screens_count, summary.data?.cpm]);


    const { mutate: createCampaign, loading: createLoading } = useApiMutation<IAdsManager, any>({
        url: API_ENDPOINTS.adsManager.create,
        method: 'POST',
        onSuccess: () => {
            enqueueSnackbar('Campaign created successfully!', { variant: 'success' });
            navigate(paths.dashboard.adsManager);
        },
        onError: (error) => {
            console.error('Error creating campaign:', error);
            enqueueSnackbar('Error creating campaign', { variant: 'error' });
        },
    });


    const { mutate: updateCampaign, loading: updateLoading } = useApiMutation<IAdsManager, any>({
        url: API_ENDPOINTS.adsManager.update(currentCampaign?.id || ''),
        method: 'PUT',
        onSuccess: () => {
            enqueueSnackbar('Campaign updated successfully!', { variant: 'success' });
            navigate(paths.dashboard.adsManager);
        },
        onError: (error) => {
            console.error('Error updating campaign:', error);
            enqueueSnackbar('Error updating campaign', { variant: 'error' });
        },
    });


    const selectedRegion = useMemo(() =>
        regions.find(r => r.value === values.geoTarget.region),
        [regions, values.geoTarget.region]
    );

    const selectedDistrict = useMemo(() =>
        districts.find(d => d.value === values.geoTarget.district),
        [districts, values.geoTarget.district]
    );


    const handleDropContentFiles = useCallback((acceptedFiles: File[]) => {
        setValue('contentFiles', acceptedFiles, { shouldValidate: true });
    }, [setValue]);

    const handleRemoveContentFile = useCallback((inputFile: CustomFile | string) => {
        setValue('contentFiles', [], { shouldValidate: true });
    }, [setValue]);

    const handleRemoveAllContentFiles = useCallback(() => {
        setValue('contentFiles', [], { shouldValidate: true });
    }, [setValue]);

    const onSubmit = useCallback(
        async (data: FormValues) => {
            try {

                const scheduleSlots = Object.values(data.schedule).filter(Boolean).length;
                const scheduleCoverage = ((scheduleSlots / (7 * 24)) * 100).toFixed(1);


                const transformSchedule = (schedule: WeeklySchedule): { [day: string]: number[] } => {
                    const transformedSchedule: { [day: string]: number[] } = {};


                    [0, 1, 2, 3, 4, 5, 6].forEach(day => {
                        transformedSchedule[day.toString()] = [];
                    });


                    Object.entries(schedule).forEach(([key, isSelected]) => {
                        if (isSelected && key.includes('-')) {
                            const [day, hour] = key.split('-').map(Number);
                            if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23) {
                                const dayKey = day.toString();
                                if (!transformedSchedule[dayKey].includes(hour)) {
                                    transformedSchedule[dayKey].push(hour);
                                }
                            }
                        }
                    });


                    Object.keys(transformedSchedule).forEach(day => {
                        transformedSchedule[day].sort((a, b) => a - b);
                    });

                    return transformedSchedule;
                };

                const transformedSchedule = transformSchedule(data.schedule);


                const formInterestIds = data.interests
                    .map(interestName => interestsData?.find(interest => interest.name === interestName)?.id)
                    .filter(id => id !== undefined) as number[];


                const venueTypeIds = data.venueTypes;


                let payload: IAdsManagerCreateUpdate | FormData;

                if (data.contentFiles && data.contentFiles.length > 0) {

                    const formData = new FormData();
                    formData.append('campaign_name', data.campaignName);
                    if (data.link) {
                        formData.append('link', data.link);
                    }
                    formData.append('budget', data.budget.toString());
                    formData.append('currency', data.currency);
                    formData.append('start_date', data.startDate?.toISOString() || '');
                    formData.append('end_date', data.endDate?.toISOString() || '');

                    if (data.geoTarget.region) {
                        formData.append('region_id', data.geoTarget.region.toString());
                    }
                    if (data.geoTarget.district) {
                        formData.append('district_id', data.geoTarget.district.toString());
                    }

                    if (formInterestIds.length > 0) {
                        formInterestIds.forEach(id => formData.append('interest_ids', id.toString()));
                    }
                    if (venueTypeIds.length > 0) {
                        venueTypeIds.forEach(id => formData.append('venue_type_ids', id.toString()));
                    }

                    formData.append('schedule', JSON.stringify(transformedSchedule));

                    if (data.contentType) {
                        formData.append('content_type', data.contentType);
                    }
                    if (data.displayDuration) {
                        formData.append('display_duration', data.displayDuration.toString());
                    }


                    data.contentFiles.forEach((file, index) => {
                        formData.append(`content_files`, file);
                    });

                    payload = formData;
                } else {

                    payload = {
                        campaign_name: data.campaignName,
                        link: data.link,
                        budget: data.budget,
                        currency: data.currency,
                        start_date: data.startDate?.toISOString() || '',
                        end_date: data.endDate?.toISOString() || '',
                        region_id: data.geoTarget.region || undefined,
                        district_id: data.geoTarget.district || undefined,
                        interest_ids: formInterestIds,
                        venue_type_ids: venueTypeIds,
                        schedule: transformedSchedule,
                        content_type: data.contentType,
                        display_duration: data.displayDuration,
                    };
                }

                // Log payload for development
                console.log('Campaign Payload:', payload);

                // Call API to create or update campaign
                // Note: axios automatically sets Content-Type for FormData, so we don't need to set it manually
                if (!isEdit) {
                    await createCampaign(payload);
                } else {
                    await updateCampaign(payload);
                }
            } catch (error) {
                console.error('❌ Error saving campaign:', error);
                enqueueSnackbar('Error saving campaign', { variant: 'error' });
            }
        },
        [enqueueSnackbar, isEdit, createCampaign, updateCampaign, interestsData]
    );

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                { }
                {Object.keys(errors).length > 0 && (
                    <Alert severity="error">
                        <Typography variant="subtitle2" gutterBottom>
                            Please fix the following errors:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {Object.entries(errors).map(([key, error]) => {
                                const errorMessage = error && typeof error === 'object' && 'message' in error
                                    ? (error as any).message
                                    : String(error || '');
                                return (
                                    <li key={key}>
                                        <Typography variant="body2">{errorMessage}</Typography>
                                    </li>
                                );
                            })}
                        </Box>
                    </Alert>
                )}

                {/* Basic Information */}
                <Card sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="solar:info-circle-bold-duotone" width={20} />
                            <Typography variant="h6">Basic Information</Typography>
                        </Stack>

                        <RHFTextField
                            name="campaignName"
                            label="Campaign Name"
                            placeholder="Enter campaign name"
                        />

                        <RHFTextField
                            name="link"
                            label="Website URL"
                            placeholder="https://example.com"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify icon="solar:global-bold-duotone" width={24} sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                </Card>

                {/* Two Column Layout */}
                <Grid container spacing={3}>
                    {/* Left Column - Main content */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={3}>
                            {/* Dates and Content Section - Top Row */}
                            <Grid container spacing={3}>
                                {/* Dates Section */}
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:calendar-bold-duotone" width={20} />
                                                <Typography variant="h6">Placement Period</Typography>
                                            </Stack>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Controller
                                                        name="startDate"
                                                        control={control}
                                                        render={({ field, fieldState: { error } }) => (
                                                            <DatePicker
                                                                label="Start Date"
                                                                value={field.value}
                                                                onChange={(newValue) => field.onChange(newValue)}
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        error: !!error,
                                                                        helperText: error?.message,
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Controller
                                                        name="endDate"
                                                        control={control}
                                                        render={({ field, fieldState: { error } }) => (
                                                            <DatePicker
                                                                label="End Date"
                                                                value={field.value}
                                                                onChange={(newValue) => field.onChange(newValue)}
                                                                minDate={values.startDate || undefined}
                                                                slotProps={{
                                                                    textField: {
                                                                        fullWidth: true,
                                                                        error: !!error,
                                                                        helperText: error?.message,
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Content Upload Section */}
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:file-bold-duotone" width={20} />
                                                <Typography variant="h6">Content</Typography>
                                                {hasRelevantContent ? (
                                                    <Chip
                                                        label="Uploaded"
                                                        color="success"
                                                        size="small"
                                                        variant="soft"
                                                        icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Not uploaded"
                                                        color="warning"
                                                        size="small"
                                                        variant="soft"
                                                        icon={<Iconify icon="solar:danger-circle-bold" width={14} />}
                                                    />
                                                )}
                                            </Stack>

                                            <Controller
                                                name="contentType"
                                                control={control}
                                                render={({ field, fieldState: { error } }) => (
                                                    <TextField
                                                        {...field}
                                                        select
                                                        fullWidth
                                                        label="Content Type"
                                                        error={!!error}
                                                        helperText={error?.message}
                                                        size="small"
                                                        defaultValue="video"
                                                    >
                                                        {CONTENT_TYPE_OPTIONS.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Iconify
                                                                        icon={option.value === 'video' ? 'solar:video-library-bold' : 'solar:image-bold'}
                                                                        width={16}
                                                                    />
                                                                    <Typography>{option.label}</Typography>
                                                                </Stack>
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            />

                                            { }
                                            {values.contentType === 'video' ? (
                                                <>
                                                    { }
                                                    {shouldShowExistingVideo && (
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'success.lighter',
                                                                borderRadius: 1,
                                                                border: '1px solid',
                                                                borderColor: 'success.main',
                                                            }}
                                                        >
                                                            <Stack spacing={2}>
                                                                { }
                                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                                    <Iconify
                                                                        icon="solar:video-library-bold"
                                                                        width={24}
                                                                        sx={{ color: 'success.main' }}
                                                                    />
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Typography variant="subtitle2"
                                                                            color="success.darker">
                                                                            Video uploaded
                                                                        </Typography>
                                                                        <Typography variant="body2"
                                                                            color="success.dark">
                                                                            {currentCampaign.videos?.[0]?.title || 'Video file'}
                                                                            {currentCampaign.videos?.[0]?.file_size &&
                                                                                ` (${((currentCampaign.videos?.[0]?.file_size || 0) / 1024 / 1024).toFixed(2)} MB)`
                                                                            }
                                                                        </Typography>
                                                                    </Box>
                                                                    <Chip
                                                                        label="Saved"
                                                                        color="success"
                                                                        size="small"
                                                                        variant="soft"
                                                                        icon={<Iconify icon="solar:cloud-check-bold"
                                                                            width={16} />}
                                                                    />
                                                                </Stack>

                                                                { }
                                                                {currentCampaign.videos?.[0]?.video && (
                                                                    <Box
                                                                        sx={{
                                                                            position: 'relative',
                                                                            borderRadius: 1,
                                                                            overflow: 'hidden',
                                                                            bgcolor: 'grey.900',
                                                                        }}
                                                                    >
                                                                        <video
                                                                            controls
                                                                            style={{
                                                                                width: '100%',
                                                                                maxHeight: 200,
                                                                                objectFit: 'contain',
                                                                            }}
                                                                        >
                                                                            <source
                                                                                src={getMediaUrl(currentCampaign.videos?.[0]?.video || null)}
                                                                                type="video/mp4" />
                                                                            <track kind="captions" srcLang="ru"
                                                                                label="Russian" />
                                                                            Your browser does not support video.
                                                                        </video>
                                                                    </Box>
                                                                )}

                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    { }
                                                    {shouldShowNewVideo && (
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'info.lighter',
                                                                borderRadius: 1,
                                                                border: '1px solid',
                                                                borderColor: 'info.main',
                                                            }}
                                                        >
                                                            <Stack spacing={2}>
                                                                { }
                                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                                    <Iconify
                                                                        icon="solar:video-library-bold"
                                                                        width={24}
                                                                        sx={{ color: 'info.main' }}
                                                                    />
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Typography variant="subtitle2"
                                                                            color="info.darker">
                                                                            New video uploaded
                                                                        </Typography>
                                                                        <Typography variant="body2" color="info.dark">
                                                                            {values.contentFiles?.[0]?.name} ({((values.contentFiles?.[0]?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                                                        </Typography>
                                                                    </Box>
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="error"
                                                                        startIcon={<Iconify
                                                                            icon="solar:trash-bin-minimalistic-bold" />}
                                                                        onClick={() => setValue('contentFiles', [])}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </Stack>

                                                                { }
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        minHeight: 120,
                                                                        bgcolor: 'grey.900',
                                                                        color: 'common.white',
                                                                        borderRadius: 1,
                                                                    }}
                                                                >
                                                                    <Stack alignItems="center" spacing={1}>
                                                                        <Iconify icon="solar:play-circle-bold"
                                                                            width={48} />
                                                                        <Typography variant="body2">
                                                                            Video will be uploaded on save
                                                                        </Typography>
                                                                        <Typography variant="caption" color="grey.400">
                                                                            {values.contentFiles?.[0]?.name}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Box>
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    { }
                                                    {!shouldShowExistingVideo && !shouldShowNewVideo && (
                                                        <>
                                                            <RHFUpload
                                                                name="contentFiles"
                                                                multiple={false}
                                                                maxSize={52428800}
                                                                accept={{ 'video/*': [] }}
                                                                helperText="MP4, MOV, AVI up to 50MB. Only one video file"
                                                                onDrop={handleDropContentFiles}
                                                                onRemove={handleRemoveContentFile}
                                                                onRemoveAll={handleRemoveAllContentFiles}
                                                                sx={{ minHeight: 100 }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: 'warning.lighter',
                                                                    borderRadius: 1,
                                                                    opacity: 0.8,
                                                                }}
                                                            >
                                                                <Typography variant="caption" color="warning.darker">
                                                                    <strong>Important:</strong> uploaded photo or video
                                                                    content will be automatically checked by AI.
                                                                    If it does not meet legislative requirements and
                                                                    platform rules,
                                                                    your ad will be rejected.
                                                                </Typography>
                                                            </Box>
                                                        </>
                                                    )}
                                                </>
                                            ) : (

                                                <>
                                                    { }
                                                    {shouldShowExistingImages && (
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'success.lighter',
                                                                borderRadius: 1,
                                                                border: '1px solid',
                                                                borderColor: 'success.main',
                                                            }}
                                                        >
                                                            <Stack spacing={2}>
                                                                { }
                                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                                    <Iconify
                                                                        icon="solar:image-bold"
                                                                        width={24}
                                                                        sx={{ color: 'success.main' }}
                                                                    />
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Typography variant="subtitle2"
                                                                            color="success.darker">
                                                                            Images uploaded
                                                                        </Typography>
                                                                        <Typography variant="body2"
                                                                            color="success.dark">
                                                                            {currentCampaign.images?.length} images
                                                                        </Typography>
                                                                    </Box>
                                                                    <Chip
                                                                        label="Saved"
                                                                        color="success"
                                                                        size="small"
                                                                        variant="soft"
                                                                        icon={<Iconify icon="solar:cloud-check-bold"
                                                                            width={16} />}
                                                                    />
                                                                </Stack>

                                                                { }
                                                                <Box
                                                                    sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                                        gap: 1,
                                                                    }}
                                                                >
                                                                    {currentCampaign.images?.map((image, index) => (
                                                                        <Box
                                                                            key={image.id}
                                                                            sx={{
                                                                                position: 'relative',
                                                                                borderRadius: 1,
                                                                                overflow: 'hidden',
                                                                                bgcolor: 'background.neutral',
                                                                                border: '1px solid',
                                                                                borderColor: 'divider',
                                                                                aspectRatio: '1',
                                                                            }}
                                                                        >
                                                                            {image.image ? (
                                                                                <img
                                                                                    src={getMediaUrl(image.image)}
                                                                                    alt={image.title || `Image ${index + 1}`}
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'cover',
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <Box
                                                                                    sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        height: '100%',
                                                                                        color: 'text.secondary',
                                                                                    }}
                                                                                >
                                                                                    <Iconify icon="solar:image-bold"
                                                                                        width={32} />
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    ))}
                                                                </Box>

                                                                { }
                                                                <Button
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    startIcon={<Iconify icon="solar:refresh-bold" />}
                                                                    onClick={() => {

                                                                        setValue('contentFiles', []);
                                                                    }}
                                                                >
                                                                    Replace images
                                                                </Button>
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    { }
                                                    {shouldShowNewImages && (
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'info.lighter',
                                                                borderRadius: 1,
                                                                border: '1px solid',
                                                                borderColor: 'info.main',
                                                            }}
                                                        >
                                                            <Stack spacing={2}>
                                                                { }
                                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                                    <Iconify
                                                                        icon="solar:image-bold"
                                                                        width={24}
                                                                        sx={{ color: 'info.main' }}
                                                                    />
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Typography variant="subtitle2"
                                                                            color="info.darker">
                                                                            New images uploaded
                                                                        </Typography>
                                                                        <Typography variant="body2" color="info.dark">
                                                                            {values.contentFiles?.length} images
                                                                        </Typography>
                                                                    </Box>
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="error"
                                                                        startIcon={<Iconify
                                                                            icon="solar:trash-bin-minimalistic-bold" />}
                                                                        onClick={() => setValue('contentFiles', [])}
                                                                    >
                                                                        Remove all
                                                                    </Button>
                                                                </Stack>

                                                                { }
                                                                <Box
                                                                    sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                                        gap: 1,
                                                                    }}
                                                                >
                                                                    {values.contentFiles?.map((file, index) => (
                                                                        <Box
                                                                            key={index}
                                                                            sx={{
                                                                                position: 'relative',
                                                                                borderRadius: 1,
                                                                                overflow: 'hidden',
                                                                                bgcolor: 'background.neutral',
                                                                                border: '1px solid',
                                                                                borderColor: 'divider',
                                                                                aspectRatio: '1',
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={URL.createObjectURL(file)}
                                                                                alt={`Preview ${index + 1}`}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    objectFit: 'cover',
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    { }
                                                    {!shouldShowExistingImages && !shouldShowNewImages && (
                                                        <>
                                                            <RHFUpload
                                                                name="contentFiles"
                                                                multiple
                                                                maxSize={10485760}
                                                                accept={{ 'image/*': [] }}
                                                                helperText="JPG, PNG, GIF up to 10MB. Multiple images allowed"
                                                                onDrop={handleDropContentFiles}
                                                                onRemove={handleRemoveContentFile}
                                                                onRemoveAll={handleRemoveAllContentFiles}
                                                                sx={{ minHeight: 100 }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: 'warning.lighter',
                                                                    borderRadius: 1,
                                                                    opacity: 0.8,
                                                                }}
                                                            >
                                                                <Typography variant="caption" color="warning.darker">
                                                                    <strong>Important:</strong> uploaded photo or video
                                                                    content will be automatically checked by AI.
                                                                    If it does not meet legislative requirements and
                                                                    platform rules,
                                                                    your ad will be rejected.
                                                                </Typography>
                                                            </Box>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </Stack>
                                    </Card>
                                </Grid>
                            </Grid>

                            { }
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon="solar:map-point-bold-duotone" width={20} />
                                        <Typography variant="h6">Geo-targeting</Typography>
                                    </Stack>

                                    { }
                                    <RegionDistrictSelect
                                        regionFieldName="geoTarget.region"
                                        districtFieldName="geoTarget.district"
                                        regionLabel="Region"
                                        districtLabel="District / City"
                                        regionPlaceholder="Select region"
                                        districtPlaceholder="Select district"
                                    />

                                    {values.geoTarget.region && values.geoTarget.district && (
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                p: 2,
                                                border: '1px dashed',
                                                borderColor: 'info.main',
                                                borderRadius: 1,
                                                bgcolor: 'info.lighter',
                                            }}
                                        >
                                            <Iconify icon="solar:map-point-bold" width={20} color="info.main" />
                                            <Typography variant="body2" color="info.darker">
                                                <strong>Target
                                                    location:</strong> {selectedRegion?.label} → {selectedDistrict?.label}
                                            </Typography>
                                        </Stack>
                                    )}

                                </Stack>
                            </Card>

                            { }
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    { }
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:clock-circle-bold-duotone" width={20} />
                                                <Typography variant="h6">Display Time</Typography>
                                            </Stack>

                                            <Controller
                                                name="displayDuration"
                                                control={control}
                                                render={({ field, fieldState: { error } }) => (
                                                    <TextField
                                                        {...field}
                                                        select
                                                        fullWidth
                                                        label="Display duration on screen"
                                                        error={!!error}
                                                        helperText={error?.message}
                                                    >
                                                        {DISPLAY_DURATION_OPTIONS.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Iconify icon="solar:clock-circle-bold" width={16} />
                                                                    <Typography>{option.label}</Typography>
                                                                </Stack>
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            />
                                        </Stack>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    { }
                                    <Card sx={{ p: 3, position: 'relative' }}>
                                        <Stack spacing={3}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:user-id-bold-duotone" width={20} />
                                                <Typography variant="h6">Age Restriction</Typography>
                                                <Chip
                                                    label="New"
                                                    color="success"
                                                    size="small"
                                                    variant="soft"
                                                    sx={{ ml: 'auto' }}
                                                />
                                            </Stack>

                                            <Box sx={{ px: 2, opacity: 0.6 }}>
                                                <Stack direction="row" justifyContent="space-between" mb={2}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Audience Age
                                                    </Typography>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        {values.ageRange[0]} - {values.ageRange[1]} {values.ageRange[1] === 65 ? '+' : ''} years
                                                    </Typography>
                                                </Stack>

                                                <Controller
                                                    name="ageRange"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Slider
                                                            {...field}
                                                            value={field.value}
                                                            onChange={(_, newValue) => field.onChange(newValue)}
                                                            valueLabelDisplay="auto"
                                                            min={13}
                                                            max={65}
                                                            // disabled
                                                            marks={[
                                                                { value: 13, label: '13' },
                                                                { value: 18, label: '18' },
                                                                { value: 25, label: '25' },
                                                                { value: 35, label: '35' },
                                                                { value: 45, label: '45' },
                                                                { value: 55, label: '55' },
                                                                { value: 65, label: '65+' },
                                                            ]}
                                                            sx={{
                                                                '& .MuiSlider-thumb': {
                                                                    width: 20,
                                                                    height: 20,
                                                                },
                                                                '& .MuiSlider-track': {
                                                                    opacity: 0.3,
                                                                },
                                                                '& .MuiSlider-rail': {
                                                                    opacity: 0.3,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Stack>
                                    </Card>
                                </Grid>
                            </Grid>

                            { }
                            <Grid container spacing={3}>
                                { }
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2.5 }}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:users-group-rounded-bold-duotone" width={18} />
                                                <Typography variant="subtitle1">Audience Interests</Typography>
                                            </Stack>

                                            <RHFAutocomplete
                                                name="interests"
                                                label="Select interests"
                                                placeholder="Start typing..."
                                                multiple
                                                freeSolo
                                                options={availableInterests}
                                                ChipProps={{ size: 'small' }}
                                            />

                                            {values.interests.length > 0 && (
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: 'primary.lighter',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Typography variant="caption" color="primary.darker">
                                                        <strong>Selected:</strong> {values.interests.length} interests
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Card>
                                </Grid>

                                { }
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2.5 }}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:buildings-2-bold-duotone" width={18} />
                                                <Typography variant="subtitle1">Venue Types</Typography>
                                            </Stack>

                                            <RHFAutocomplete
                                                name="venueTypes"
                                                label="Select venue types"
                                                placeholder="Select types..."
                                                multiple
                                                options={availableVenueTypes.map((venue) => venue.id)}
                                                getOptionLabel={(option) =>
                                                    availableVenueTypes.find((venue) => venue.id === option)?.name || String(option)
                                                }
                                                ChipProps={{ size: 'small' }}
                                            />

                                            { }
                                            <Grid container spacing={1}>
                                                {availableVenueTypes.map((venue) => {
                                                    const isSelected = values.venueTypes.includes(venue.id);
                                                    return (
                                                        <Grid item xs={6} sm={4} key={venue.id}>
                                                            <Box
                                                                sx={{
                                                                    p: 1.5,
                                                                    border: '1px solid',
                                                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                                                    borderRadius: 1,
                                                                    bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        borderColor: 'primary.main',
                                                                        bgcolor: 'primary.lighter',
                                                                    },
                                                                }}
                                                                onClick={() => {
                                                                    const newVenueTypes = isSelected
                                                                        ? values.venueTypes.filter((v) => v !== venue.id)
                                                                        : [...values.venueTypes, venue.id];
                                                                    methods.setValue('venueTypes', newVenueTypes);
                                                                }}
                                                            >
                                                                <Stack spacing={0.5} alignItems="center">
                                                                    <Iconify
                                                                        icon="solar:buildings-2-bold-duotone"
                                                                        width={24}
                                                                        color={isSelected ? 'primary.main' : 'text.secondary'}
                                                                    />
                                                                    <Typography
                                                                        variant="caption"
                                                                        textAlign="center"
                                                                        color={isSelected ? 'primary.main' : 'text.secondary'}
                                                                        sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                                                                    >
                                                                        {venue.name}
                                                                    </Typography>
                                                                </Stack>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Stack>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Grid>

                    { }
                    <Grid item xs={12} md={4}>
                        { }
                        <Box
                            sx={{
                                position: { xs: 'static', md: 'sticky' },
                                top: { md: 80 },
                                zIndex: { md: 10 },
                                alignSelf: { md: 'flex-start' },
                            }}
                        >
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon="solar:dollar-minimalistic-bold-duotone" width={20} />
                                        <Typography variant="h6">Budget</Typography>
                                    </Stack>

                                    <Controller
                                        name="currency"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Currency"
                                                error={!!error}
                                                helperText={error?.message}
                                                size="small"
                                            >
                                                {CURRENCIES.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography>{option.label}</Typography>
                                                            <Typography
                                                                color="text.secondary">({option.symbol})</Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />

                                    <RHFTextField
                                        name="budget"
                                        label="Campaign Budget"
                                        type="number"
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    {CURRENCIES.find((c) => c.value === values.currency)?.symbol}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    { }
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            bgcolor: 'primary.lighter',
                                            borderRadius: 1.5,
                                            border: '1px solid',
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:chart-2-bold-duotone" width={20} />
                                                <Typography variant="subtitle2" color="primary.darker">
                                                    <strong>Performance Forecast</strong>
                                                </Typography>
                                            </Stack>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="primary.dark" gutterBottom>
                                                        CPM
                                                    </Typography>
                                                    <Typography variant="h6" color="primary.darker">
                                                        ${forecast.cpm}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="primary.dark" gutterBottom>
                                                        Impressions
                                                    </Typography>
                                                    <Typography variant="h6" color="primary.darker">
                                                        {forecast.impressions}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="primary.dark" gutterBottom>
                                                        Screens
                                                    </Typography>
                                                    <Typography variant="h6" color="primary.darker">
                                                        {forecast.screens}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>

                { }
                <Controller
                    name="schedule"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <Dialog
                            open={isCalendarOpen}
                            onClose={() => setIsCalendarOpen(false)}
                            maxWidth={false}
                            fullWidth
                            PaperProps={{
                                sx: {
                                    width: '95vw',
                                    maxWidth: 'none',
                                    height: '95vh',
                                    maxHeight: 'none',
                                    m: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                },
                            }}
                        >
                            <DialogTitle sx={{
                                pb: 1,
                                flexShrink: 0,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Iconify icon="solar:calendar-bold-duotone" width={20} />
                                    <Typography variant="h6">Ad Display Schedule</Typography>
                                </Stack>
                            </DialogTitle>

                            <DialogContent
                                dividers
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Stack spacing={2} sx={{ flex: 1 }}>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 1 }}>
                                            <Typography variant="body2">{error.message}</Typography>
                                        </Alert>
                                    )}

                                    <Box sx={{ flex: 1, minHeight: 0 }}>
                                        <WeeklyScheduleCalendar
                                            key={`${currentCampaign?.id || 'new-campaign'}-${JSON.stringify(field.value || {})}`}
                                            value={field.value || {}}
                                            onChange={field.onChange}
                                            startDate={values.startDate || undefined}
                                            endDate={values.endDate || undefined}
                                            disabled={isSubmitting}
                                        />
                                    </Box>

                                    {Object.values(field.value).filter(Boolean).length > 0 && (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                bgcolor: 'success.lighter',
                                                borderRadius: 1,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Typography variant="caption" color="success.darker">
                                                <strong>Great!</strong> Ads will be displayed during selected time slots
                                                throughout the campaign period.
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </DialogContent>

                            <DialogActions sx={{
                                p: 2,
                                flexShrink: 0,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            }}>
                                <Button onClick={() => setIsCalendarOpen(false)}>
                                    Close
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => setIsCalendarOpen(false)}
                                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                                >
                                    Done
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}
                />

                { }
                <Fab
                    color="primary"
                    aria-label="open calendar"
                    sx={{
                        position: 'fixed',
                        bottom: 100,
                        right: 24,
                        zIndex: 1300,
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        },
                    }}
                    onClick={() => setIsCalendarOpen(true)}
                >
                    <Iconify icon="solar:calendar-bold-duotone" width={24} />
                </Fab>

                { }
                <Card sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Button
                            size="large"
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate(paths.dashboard.adsManager)}
                            startIcon={<Iconify icon="solar:arrow-left-bold" />}
                        >
                            Cancel
                        </Button>

                        <Stack direction="row" spacing={2}>
                            <Button
                                size="large"
                                variant="outlined"
                                startIcon={<Iconify icon="solar:diskette-bold" />}
                            >
                                Save as draft
                            </Button>
                            <Button
                                size="large"
                                type="submit"
                                variant="contained"
                                startIcon={<Iconify icon="solar:rocket-2-bold" />}
                                disabled={isSubmitting || createLoading || updateLoading}
                            >
                                {isEdit ? 'Update Campaign' : 'Launch Campaign'}
                            </Button>
                        </Stack>
                    </Stack>
                </Card>
            </Stack>
        </FormProvider>
    );
}

