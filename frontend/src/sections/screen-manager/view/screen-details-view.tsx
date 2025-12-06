import {useState, useEffect, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import Map from 'react-map-gl';

import {styled} from '@mui/material/styles';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';

import {MAPBOX_API} from 'src/config-global';

import Iconify from 'src/components/iconify';
import {useSettingsContext} from 'src/components/settings';
import {MapControl, MapMarker} from 'src/components/map';
import {useApiQuery} from 'src/hooks/use-api-query';

import type {IScreenManager} from 'src/types/screen-manager';

import {API_ENDPOINTS} from 'src/utils/axios';

import {paths} from 'src/routes/paths';

const StyledMapContainer = styled(Card)(({theme}) => ({
    height: 300,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
        display: 'none',
    },
}));

const mapBackendStatusToFrontend = (backendStatus: string): string => {
    if (backendStatus === 'active') return 'online';
    if (backendStatus === 'inactive') return 'offline';
    return backendStatus;
};

const getStatusColor = (status: string) => {
    if (status === 'active' || status === 'online') return 'success';
    if (status === 'maintenance') return 'warning';
    return 'error';
};

interface DisplayScreen {
    id: string;
    name: string;
    location: string;
    venue: string;
    status: string;
    backendStatus: string;
    resolution: string;
    size: string;
    uptime: number;
    lastSeen: string;
    revenue: number;
    impressions: number;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export default function ScreenDetailsView() {
    const settings = useSettingsContext();
    const navigate = useNavigate();
    const {id} = useParams();

    
    const {
        data: screenData,
        loading,
        error
    } = useApiQuery<IScreenManager>({
        url: API_ENDPOINTS.screenManager.detail(id || ''),
        enabled: !!id,
    });

    // Transform backend data to frontend display format
    const screen = useMemo((): DisplayScreen | null => {
        if (!screenData) return null;

        return {
            id: screenData.id.toString(),
            name: screenData.title,
            location: screenData.position,
            venue: screenData.type_category,
            status: mapBackendStatusToFrontend(screenData.status),
            backendStatus: screenData.status, // Keep original backend status for color logic
            resolution: `${screenData.screen_resolution}x1080`,
            size: screenData.screen_size,
            uptime: 95.0, // Default value since not in backend
            lastSeen: screenData.updated_at,
            revenue: Math.floor(Math.random() * 1000) + 500, // Mock revenue
            impressions: Math.floor(Math.random() * 50000) + 10000, // Mock impressions
            coordinates: {
                lat: 41.2995 + (Math.random() - 0.5) * 0.02, // Mock coordinates around Tashkent
                lng: 69.2401 + (Math.random() - 0.5) * 0.02,
            },
        };
    }, [screenData]);

    if (loading) {
        return (
            <Container maxWidth={settings.themeStretch ? false : 'xl'}>
                <Stack spacing={3}>
                    <Skeleton variant="text" width={300} height={36}/>
                    <Grid container spacing={3}>
                        {[...Array(4)].map((_, i) => (
                            <Grid key={i} xs={12} md={3}>
                                <Card sx={{p: 3}}>
                                    <Skeleton variant="text" width="100%" height={60}/>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </Container>
        );
    }

    if (error || (!loading && !screen)) {
        return (
            <Container maxWidth={settings.themeStretch ? false : 'xl'}>
                <Stack spacing={3}>
                    <Typography variant="h6">Screen not found</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {error ? 'Error loading screen data' : 'Screen with the specified ID does not exist'}
                    </Typography>
                </Stack>
            </Container>
        );
    }

    if (!screen) {
        return null;
    }

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Stack spacing={3}>
                {}
                <Breadcrumbs>
                    <Link
                        color="inherit"
                        href="/dashboard/screen-manager"
                        sx={{display: 'flex', alignItems: 'center'}}
                    >
                        <Iconify icon="solar:home-2-bold-duotone" width={16} sx={{mr: 0.5}}/>
                        Screen Manager
                    </Link>
                    <Typography color="text.primary">Screen Details</Typography>
                </Breadcrumbs>

                {}
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between"
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.05) 100%)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={1.5}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {screen.name}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip
                                label={screen.status}
                                color={getStatusColor(screen.backendStatus)}
                                size="medium"
                                sx={{ 
                                    fontWeight: 600,
                                    height: 32,
                                }}
                            />
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify icon="solar:buildings-2-bold-duotone" width={18} sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {screen.venue}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="solar:pen-bold"/>}
                            onClick={() => navigate(paths.dashboard.screens.edit(screen.id))}
                            sx={{
                                borderWidth: 2,
                                fontWeight: 600,
                                '&:hover': {
                                    borderWidth: 2,
                                    background: 'rgba(25, 118, 210, 0.08)',
                                },
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="solar:chart-2-bold"/>}
                            sx={{
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                                },
                            }}
                        >
                            Analytics
                        </Button>
                    </Stack>
                </Stack>

                {}
                <Grid container spacing={3}>
                    <Grid xs={12} md={3}>
                        <Card 
                            sx={{ 
                                p: 3,
                                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
                                },
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Uptime
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                        }}
                                    >
                                        <Iconify
                                            icon="solar:chart-bold-duotone"
                                            width={24}
                                            sx={{ color: 'white' }}
                                        />
                                    </Box>
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                    {screen.uptime}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={screen.uptime}
                                    color={(() => {
                                        if (screen.uptime >= 98) return 'success';
                                        if (screen.uptime >= 95) return 'warning';
                                        return 'error';
                                    })()}
                                    sx={{ height: 6, borderRadius: 3 }}
                                />
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={3}>
                        <Card 
                            sx={{ 
                                p: 3,
                                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)',
                                },
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Impressions
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                        }}
                                    >
                                        <Iconify
                                            icon="solar:eye-bold-duotone"
                                            width={24}
                                            sx={{ color: 'white' }}
                                        />
                                    </Box>
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                    {(screen.impressions / 1000).toFixed(1)}K
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Iconify icon="eva:trending-up-fill" width={16} sx={{ color: 'success.main' }}/>
                                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                        +8.2% this week
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={3}>
                        <Card 
                            sx={{ 
                                p: 3,
                                background: 'linear-gradient(135deg, rgba(255, 171, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 8px rgba(255, 171, 0, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 16px rgba(255, 171, 0, 0.2)',
                                },
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Revenue
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #ffab00 0%, #ffc107 100%)',
                                            boxShadow: '0 4px 12px rgba(255, 171, 0, 0.3)',
                                        }}
                                    >
                                        <Iconify
                                            icon="solar:dollar-minimalistic-bold-duotone"
                                            width={24}
                                            sx={{ color: 'white' }}
                                        />
                                    </Box>
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffab00' }}>
                                    ${screen.revenue.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    This month
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={3}>
                        <Card 
                            sx={{ 
                                p: 3,
                                background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.1) 0%, rgba(0, 184, 217, 0.05) 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 8px rgba(0, 184, 217, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 16px rgba(0, 184, 217, 0.2)',
                                },
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Last Activity
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #00b8d9 0%, #00acc1 100%)',
                                            boxShadow: '0 4px 12px rgba(0, 184, 217, 0.3)',
                                        }}
                                    >
                                        <Iconify
                                            icon="solar:clock-circle-bold-duotone"
                                            width={24}
                                            sx={{ color: 'white' }}
                                        />
                                    </Box>
                                </Stack>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {new Date(screen.lastSeen).toLocaleString('ru-RU')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {screen.status === 'online' ? 'Currently active' : 'Offline'}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {}
                <Card 
                    sx={{ 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Stack spacing={3}>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Screen Information
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Link
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Iconify icon="mdi:link" width={20}/>
                                            <Link
                                                href={`${window.location.origin}/serve/${screen.id}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                color="primary"
                                                underline="hover"
                                            >
                                                {window.location.origin}/serve/{screen.id}
                                            </Link>
                                        </Stack>
                                    </Box>
                                    <Divider/>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Location
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Iconify icon="solar:map-point-bold-duotone" width={20}/>
                                            <Typography variant="body1">{screen.location}</Typography>
                                        </Stack>
                                    </Box>

                                    <Divider/>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Venue Type
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Iconify icon="solar:buildings-2-bold-duotone" width={20}/>
                                            <Typography variant="body1">{screen.venue}</Typography>
                                        </Stack>
                                    </Box>

                                    <Divider/>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Status
                                        </Typography>
                                        <Chip
                                            label={screen.status}
                                            color={getStatusColor(screen.status)}
                                            size="medium"
                                        />
                                    </Box>
                                </Stack>
                            </Grid>

                            <Grid xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Resolution
                                        </Typography>
                                        <Typography variant="body1">{screen.resolution}</Typography>
                                    </Box>

                                    <Divider/>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Screen Size
                                        </Typography>
                                        <Typography variant="body1">{screen.size}</Typography>
                                    </Box>

                                    <Divider/>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            CPM
                                        </Typography>
                                        <Typography variant="body1">
                                            ${((screen.revenue / screen.impressions) * 1000).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                </Card>

                {}
                {screen.coordinates && (() => {
                    const {lat, lng} = screen.coordinates;
                    return (
                        <Card 
                            sx={{ 
                                p: 3,
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <Stack spacing={3}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                                        }}
                                    >
                                        <Iconify icon="solar:map-point-bold-duotone" width={20} sx={{ color: 'white' }}/>
                                    </Box>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Location on Map
                                    </Typography>
                                </Stack>

                                <StyledMapContainer>
                                    <Map
                                        initialViewState={{
                                            latitude: lat,
                                            longitude: lng,
                                            zoom: 14,
                                        }}
                                        mapStyle="https://tiles.stadiamaps.com/styles/osm_bright.json"
                                        mapboxAccessToken={MAPBOX_API}
                                    >
                                        <MapControl hideGeolocateControl/>
                                        <MapMarker
                                            latitude={lat}
                                            longitude={lng}
                                        />
                                    </Map>
                                </StyledMapContainer>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'background.neutral',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="caption" color="text.secondary">
                                            Latitude
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {lat.toFixed(6)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="caption" color="text.secondary">
                                            Longitude
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {lng.toFixed(6)}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Iconify icon="solar:map-bold"/>}
                                        onClick={() =>
                                            window.open(
                                                `https://www.google.com/maps?q=${lat},${lng}`,
                                                '_blank'
                                            )
                                        }
                                        sx={{
                                            borderWidth: 2,
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderWidth: 2,
                                                background: 'rgba(25, 118, 210, 0.08)',
                                            },
                                        }}
                                    >
                                        Open in Google Maps
                                    </Button>
                                </Stack>
                            </Stack>
                        </Card>
                    );
                })()}

                {}
                <Card 
                    sx={{ 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Stack spacing={3}>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Screen Performance
                        </Typography>
                        <Box
                            sx={{
                                p: 5,
                                textAlign: 'center',
                                bgcolor: 'background.neutral',
                                borderRadius: 2,
                            }}
                        >
                            <Iconify
                                icon="solar:chart-2-bold-duotone"
                                width={48}
                                sx={{color: 'text.disabled', mb: 2}}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Performance chart will be here
                            </Typography>
                        </Box>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}

