import {useMemo, useCallback, useState, useEffect} from 'react';
import * as Yup from 'yup';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigate} from 'react-router-dom';

import {
    Card,
    Stack,
    Button,
    Box,
    Grid,
    TextField,
    MenuItem,
    Alert,
    Typography,
    Chip,
} from '@mui/material';

import {paths} from 'src/routes/paths';

import Iconify from 'src/components/iconify';
import {useSnackbar} from 'src/components/snackbar';
import {useBoolean} from 'src/hooks/use-boolean';
import {GeoTargetingMap, LocationPickerDialog} from 'src/components/map';
import FormProvider, {
    RHFTextField,
    RHFAutocomplete,
} from 'src/components/hook-form';
import {useApiMutation} from 'src/hooks/use-api-mutation';
import {useRegionDistrictOptions} from 'src/hooks/use-regions';

import type {IScreenManagerCreateUpdate, IScreenManagerStatus} from 'src/types/screen-manager';

import {API_ENDPOINTS} from 'src/utils/axios';
import {type GeoTarget, getDistrictsByRegion, REGIONS_DATA} from "../../constants/regions-data";
import RegionDistrictSelect from "../../components/region-district-select";

const VENUE_TYPES = [
    'Business Center',
    'Shopping Mall',
    'Airport',
    'Hotel',
    'Fitness Center',
    'Coworking Space',
    'Restaurant',
    'Cinema',
    'Metro Station',
    'Bus Terminal',
];

const RESOLUTIONS = [
    {value: 1920, label: '1920x1080 (Full HD)'},
    {value: 2560, label: '2560x1440 (WQHD)'},
    {value: 3840, label: '3840x2160 (4K UHD)'},
    {value: 1280, label: '1280x720 (HD)'},
    {value: 1366, label: '1366x768 (HD)'},
];

const SCREEN_SIZES = [
    '32 inch',
    '40 inch',
    '43 inch',
    '50 inch',
    '55 inch',
    '65 inch',
    '75 inch',
    '85 inch',
];

const STATUS_OPTIONS = [
    {value: 'active', label: 'Active'},
    {value: 'inactive', label: 'Inactive'},
    {value: 'maintenance', label: 'Maintenance'},
];

interface FormValues {
    title: string;
    position: string;
    location?: string;
    type_category: string;
    status: IScreenManagerStatus;
    screen_resolution: number;
    screen_size: string;
    geoTarget: {
        region: number | null;
        district: number | null;
    };
}

interface ScreenNewEditFormProps {
    currentScreen?: any;
    isEdit?: boolean;
}

export default function ScreenNewEditForm({
                                              currentScreen,
                                              isEdit = false,
                                          }: ScreenNewEditFormProps) {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const mapDialog = useBoolean();

    
    const {mutate: createScreen, loading: createLoading} = useApiMutation({
        url: API_ENDPOINTS.screenManager.create,
        method: 'POST',
        onSuccess: () => {
            enqueueSnackbar('Screen created successfully!', {variant: 'success'});
            navigate(paths.dashboard.screenManager);
        },
        onError: (error) => {
            console.error('Create error:', error);
            enqueueSnackbar('Error creating screen', {variant: 'error'});
        },
    });

    const {mutate: updateScreen, loading: updateLoading} = useApiMutation({
        url: API_ENDPOINTS.screenManager.update(currentScreen?.id || ''),
        method: 'PUT',
        onSuccess: () => {
            enqueueSnackbar('Screen updated successfully!', {variant: 'success'});
            navigate(paths.dashboard.screenManager);
        },
        onError: (error) => {
            console.error('Update error:', error);
            enqueueSnackbar('Error updating screen', {variant: 'error'});
        },
    });

    const [locationCoords, setLocationCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(currentScreen?.coordinates || null);
    
    
    const [needsDistrictSet, setNeedsDistrictSet] = useState(false);

    const ScreenSchema = Yup.object({
        title: Yup.string().required().max(255),
        position: Yup.string().required().max(255),
        location: Yup.string().max(255),
        type_category: Yup.string().required().max(255),
        status: Yup.mixed<'active' | 'inactive' | 'maintenance'>()
            .oneOf(['active', 'inactive', 'maintenance'])
            .required(),
        screen_resolution: Yup.number().required().min(1),
        screen_size: Yup.string().required().max(255),
        geoTarget: Yup.object({
            region: Yup.number().nullable().default(null),
            district: Yup.number().nullable().default(null),
        }).default({region: null, district: null}),
    })
        .test('location-choice', 'Specify region and district or select a point on the map', (values: any) => {
            const hasCoords = !!(values && values.coordinates); 
            const hasGeo = !!(values?.geoTarget?.region) && !!(values?.geoTarget?.district);
            return hasCoords || hasGeo;
        });

    const defaultValues = useMemo<FormValues>(() => ({
        title: currentScreen?.title || currentScreen?.name || '',
        position: currentScreen?.position || currentScreen?.location || '',
        location: currentScreen?.location || currentScreen?.position || '',
        type_category: currentScreen?.type_category || currentScreen?.venue || '',
        status: (() => {
            const s = currentScreen?.status;
            if (s === 'online') return 'active';
            if (s === 'offline') return 'inactive';
            return (s as IScreenManagerStatus) || 'inactive';
        })(),
        screen_resolution: currentScreen?.screen_resolution || 1920,
        screen_size: currentScreen?.screen_size || currentScreen?.size || '55 inch',

        geoTarget: {
            region: (() => {
                
                if (typeof currentScreen?.geoTarget?.region === 'number') {
                    return currentScreen.geoTarget.region;
                }
                
                if (currentScreen?.region?.id) {
                    return currentScreen.region.id;
                }
                return null;
            })(),
            district: (() => {
                
                if (typeof currentScreen?.geoTarget?.district === 'number') {
                    return currentScreen.geoTarget.district;
                }
                
                if (currentScreen?.district?.id) {
                    return currentScreen.district.id;
                }
                return null;
            })(),
        },
    }), [currentScreen]);

    const methods = useForm<FormValues>({
        resolver: yupResolver(ScreenSchema),
        defaultValues,
    });

    const {
        watch,
        control,
        setValue,
        handleSubmit,
        reset,
        formState: {errors},
    } = methods;

    const values = watch();

    
    const currentRegionId = watch('geoTarget.region');
    const currentDistrictId = watch('geoTarget.district');
    
    
    const { districts, loading: districtsLoading } = useRegionDistrictOptions(currentRegionId);

    
    useEffect(() => {
        if (currentScreen && isEdit) {
            const newDefaultValues = {
                title: currentScreen?.title || currentScreen?.name || '',
                position: currentScreen?.position || currentScreen?.location || '',
                location: currentScreen?.location || currentScreen?.position || '',
                type_category: currentScreen?.type_category || currentScreen?.venue || '',
                status: (() => {
                    const s = currentScreen?.status;
                    if (s === 'online') return 'active';
                    if (s === 'offline') return 'inactive';
                    return (s as IScreenManagerStatus) || 'inactive';
                })(),
                screen_resolution: currentScreen?.screen_resolution || 1920,
                screen_size: currentScreen?.screen_size || currentScreen?.size || '55 inch',
                geoTarget: {
                    region: (() => {
                        
                        if (typeof currentScreen?.geoTarget?.region === 'number') {
                            return currentScreen.geoTarget.region;
                        }
                        
                        if (currentScreen?.region?.id) {
                            return currentScreen.region.id;
                        }
                        return null;
                    })(),
                    district: (() => {
                        
                        if (typeof currentScreen?.geoTarget?.district === 'number') {
                            return currentScreen.geoTarget.district;
                        }
                        
                        if (currentScreen?.district?.id) {
                            return currentScreen.district.id;
                        }
                        return null;
                    })(),
                },
            };
            reset(newDefaultValues);
            
            
            const targetDistrictId = (() => {
                if (typeof currentScreen?.geoTarget?.district === 'number') {
                    return currentScreen.geoTarget.district;
                }
                if (currentScreen?.district?.id) {
                    return currentScreen.district.id;
                }
                return null;
            })();
            
            if (targetDistrictId) {
                setNeedsDistrictSet(true);
            }
        }
    }, [currentScreen, isEdit, reset]);

    
    useEffect(() => {
        if (needsDistrictSet && isEdit && currentScreen && currentRegionId && !districtsLoading && districts.length > 0) {
            
            let targetDistrictId: number | null = null;
            
            if (typeof currentScreen?.geoTarget?.district === 'number') {
                targetDistrictId = currentScreen.geoTarget.district;
            } else if (currentScreen?.district?.id) {
                targetDistrictId = currentScreen.district.id;
            }
            
            
            if (targetDistrictId && currentDistrictId !== targetDistrictId) {
                
                const districtExists = districts.some(d => d.value === targetDistrictId);
                if (districtExists) {
                    setValue('geoTarget.district', targetDistrictId);
                    setNeedsDistrictSet(false); 
                }
            }
        }
    }, [needsDistrictSet, currentScreen, isEdit, currentRegionId, districtsLoading, districts, currentDistrictId, setValue]);

    
    const handleLocationSelect = useCallback(
        (location: { address: string; lat: number; lng: number }) => {
            setLocationCoords({lat: location.lat, lng: location.lng});
            setValue('position', location.address);
            setValue('location', location.address); 
            enqueueSnackbar('Location selected successfully on map!', {variant: 'success'});
        },
        [setValue, enqueueSnackbar]
    );

    const onSubmit = useCallback(
        async (data: FormValues) => {
            try {
                
                const apiData: IScreenManagerCreateUpdate = {
                    title: data.title,
                    position: data.position,
                    location: data.location || data.position, 
                    coordinates: locationCoords, 
                    status: data.status,
                    type_category: data.type_category,
                    screen_size: data.screen_size,
                    screen_resolution: data.screen_resolution,
                    region_id: data.geoTarget?.region ?? null,
                    district_id: data.geoTarget.district ?? null,
                };

                console.log('Submitting screen data:', apiData);
                console.log('Location coordinates:', locationCoords);

                
                if (isEdit) {
                    await updateScreen(apiData);
                } else {
                    await createScreen(apiData);
                }
            } catch (error) {
                console.error('Submit error:', error);
            }
        },
        [isEdit, createScreen, updateScreen, locationCoords]
    );

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                {}
                {Object.keys(errors).length > 0 && (
                    <Alert severity="error">
                        <Typography variant="subtitle2" gutterBottom>
                            Please fix the following errors:
                        </Typography>
                        <Box component="ul" sx={{pl: 2, m: 0}}>
                            {Object.entries(errors).map(([key, error]) => (
                                <li key={key}>
                                    <Typography variant="body2">{error.message}</Typography>
                                </li>
                            ))}
                        </Box>
                    </Alert>
                )}

                {}
                <Card sx={{p: 3}}>
                    <Stack spacing={3}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="solar:monitor-bold-duotone" width={20}/>
                            <Typography variant="h6">Basic Information</Typography>
                        </Stack>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <RHFTextField
                                    name="title"
                                    label="Screen Title"
                                    placeholder="For example: Tashkent Center - Lobby"
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </Card>

                {}
                <Grid container spacing={3}>
                    {}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <Card sx={{p: 3}}>
                                <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon="solar:monitor-bold-duotone" width={20}/>
                                        <Typography variant="h6">Geotargeting</Typography>
                                    </Stack>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <RHFTextField
                                                    name="position"
                                                    label="Position/Location"
                                                    placeholder="For example: Independence Square, Tashkent"
                                                />
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    startIcon={<Iconify icon="solar:map-point-bold-duotone"/>}
                                                    onClick={mapDialog.onTrue}
                                                    fullWidth
                                                    sx={{mt: 2}}  
                                                >
                                                    Select on Map
                                                </Button>
                                                {locationCoords && (
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: 'success.lighter',
                                                            borderRadius: 1,
                                                            mt: 2, 
                                                        }}
                                                    >
                                                        <Iconify icon="solar:check-circle-bold" width={20}
                                                                 color="success.main"/>
                                                        <Stack spacing={0.5} flex={1}>
                                                            <Typography variant="caption" fontWeight="bold"
                                                                        color="success.darker">
                                                                Coordinates Set
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Lat: {locationCoords.lat.toFixed(6)},
                                                                Lng: {locationCoords.lng.toFixed(6)}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                )}
                                            </Stack>

                                            <Stack spacing={2} sx={{
                                                mt: 2, 
                                            }}>
                                                <RegionDistrictSelect
                                                    regionFieldName="geoTarget.region"
                                                    districtFieldName="geoTarget.district"
                                                    regionLabel="Region"
                                                    districtLabel="District / City"
                                                    size="medium"
                                                    fullWidth={false}
                                                    onRegionChange={(regionId, regionOption) => {
                                                        
                                                    }}
                                                    onDistrictChange={(districtId, districtOption) => {
                                                        
                                                    }}
                                                />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Card>

                            {}
                            <Card sx={{p: 3}}>
                                <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon="solar:buildings-2-bold-duotone" width={20}/>
                                        <Typography variant="h6">Venue Type and Status</Typography>
                                    </Stack>

                                    <RHFAutocomplete
                                        name="type_category"
                                        label="Venue Type"
                                        placeholder="Select venue type"
                                        options={VENUE_TYPES}
                                    />

                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({field, fieldState: {error}}) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Status"
                                                error={!!error}
                                                helperText={error?.message}
                                            >
                                                {STATUS_OPTIONS.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Box
                                                                sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    bgcolor: (() => {
                                                                        if (option.value === 'active') return 'success.main';
                                                                        if (option.value === 'maintenance') return 'warning.main';
                                                                        return 'error.main';
                                                                    })(),
                                                                }}
                                                            />
                                                            <Typography>{option.label}</Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />

                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: 'info.lighter',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Stack direction="row" spacing={1}>
                                            <Iconify icon="solar:info-circle-bold-duotone" width={20}
                                                     color="info.main"/>
                                            <Typography variant="caption" color="info.darker">
                                                <strong>Tip:</strong> Status &quot;Active&quot; means the screen is
                                                active and showing ads.
                                                &quot;Maintenance&quot; - screen is under
                                                maintenance. &quot;Inactive&quot; - screen is not working.
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>

                        </Stack>
                    </Grid>

                    {}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            {}
                            <Card sx={{p: 3}}>
                                <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon="solar:settings-bold-duotone" width={20}/>
                                        <Typography variant="h6">Technical Specifications</Typography>
                                    </Stack>

                                    <Controller
                                        name="screen_resolution"
                                        control={control}
                                        render={({field, fieldState: {error}}) => (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Screen Resolution"
                                                placeholder="Select resolution"
                                                error={!!error}
                                                helperText={error?.message || "Select screen resolution"}
                                            >
                                                {RESOLUTIONS.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />

                                    <RHFAutocomplete
                                        name="screen_size"
                                        label="Screen Size"
                                        placeholder="Select size"
                                        options={SCREEN_SIZES}
                                    />

                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="subtitle2" gutterBottom>
                                            Display Information
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">
                                                    Resolution
                                                </Typography>
                                                <Typography variant="body2">
                                                    {RESOLUTIONS.find(r => r.value === values.screen_resolution)?.label || 'Not selected'}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">
                                                    Size
                                                </Typography>
                                                <Typography
                                                    variant="body2">{values.screen_size || 'Not selected'}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">
                                                    Type
                                                </Typography>
                                                <Typography variant="body2">
                                                    {values.screen_resolution >= 3840 ? '4K UHD' : 'Full HD'}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>

                            {}
                            <Card sx={{p: 3}}>
                                <Stack spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Iconify icon="solar:map-point-bold-duotone" width={20}/>
                                        <Typography variant="h6">Location Preview</Typography>
                                    </Stack>

                                    <Box
                                        sx={{
                                            p: 3,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 2,
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {values.title || 'Screen Title'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                📍 {values.position || 'Location'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                🏢 {values.type_category || 'Venue Type'}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>

                {}
                <Card sx={{p: 3}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Button
                            size="large"
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate(paths.dashboard.screenManager)}
                            startIcon={<Iconify icon="solar:arrow-left-bold"/>}
                        >
                            Cancel
                        </Button>

                        <Stack direction="row" spacing={2}>
                            <Button
                                size="large"
                                variant="outlined"
                                startIcon={<Iconify icon="solar:diskette-bold"/>}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                size="large"
                                type="submit"
                                variant="contained"
                                startIcon={<Iconify icon="solar:check-circle-bold"/>}
                                disabled={createLoading || updateLoading}
                            >
                                {isEdit ? 'Update Screen' : 'Add Screen'}
                            </Button>
                        </Stack>
                    </Stack>
                </Card>
            </Stack>

            {}
            <LocationPickerDialog
                open={mapDialog.value}
                onClose={mapDialog.onFalse}
                onSelect={handleLocationSelect}
                initialLocation={
                    locationCoords
                        ? {
                            address: values.position,
                            lat: locationCoords.lat,
                            lng: locationCoords.lng,
                        }
                        : undefined
                }
            />
        </FormProvider>
    );
}

