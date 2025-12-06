import Map from 'react-map-gl';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { MAPBOX_API } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { MapControl, MapMarker, MapPopup } from 'src/components/map';

import { useApiQuery } from 'src/hooks/use-api-query';

import { IScreenManager, IScreenManagerListResponse } from 'src/types/screen-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

import { paths } from 'src/routes/paths';

const StyledMapContainer = styled(Card)(({ theme }) => ({
  zIndex: 0,
  height: 'calc(100vh - 250px)',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
    display: 'none',
  },
}));

type ScreenData = {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: string;
  type: string;
  size: string;
  resolution: string;
};

export default function BillboardMapView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const [popupInfo, setPopupInfo] = useState<ScreenData | null>(null);

  
  const { data: screensResponse, loading, error } = useApiQuery<IScreenManagerListResponse>({
    url: API_ENDPOINTS.screenManager.list,
  });

  
  const mapBackendStatusToFrontend = useCallback((backendStatus: string): string => {
    if (backendStatus === 'active') return 'online';
    if (backendStatus === 'inactive') return 'offline';
    return backendStatus;
  }, []);

  
  const screens = useMemo(() => {
    if (!screensResponse?.results) return [];

    const filteredScreens = screensResponse.results.filter((screen) => {
      
      const coords = screen.coordinates;
      return coords &&
        typeof coords === 'object' &&
        coords.lat != null &&
        coords.lng != null &&
        !Number.isNaN(Number(coords.lat)) &&
        !Number.isNaN(Number(coords.lng)) &&
        coords.lat !== 0 &&
        coords.lng !== 0;
    });

    return filteredScreens.map((screen): ScreenData => ({
      id: screen.id,
      name: screen.title,
      location: screen.location || screen.position,
      coordinates: {
        lat: screen.coordinates!.lat,
        lng: screen.coordinates!.lng,
      },
      status: mapBackendStatusToFrontend(screen.status),
      type: screen.type_category,
      size: screen.screen_size,
      resolution: `${screen.screen_resolution}x${Math.round(screen.screen_resolution * 9 / 16)}`,
    }));
  }, [screensResponse, mapBackendStatusToFrontend]);

  
  const isLight = useMemo(() => theme.palette.mode === 'light', [theme.palette.mode]);

  
  const handleMarkerClick = useCallback((screen: ScreenData) => {
    setPopupInfo(screen);
  }, []);

  const handlePopupClose = useCallback(() => {
    setPopupInfo(null);
  }, []);

  const handleViewScreenContent = useCallback((screenId: number) => {
    navigate(paths.dashboard.screens.content(screenId.toString()));
    setPopupInfo(null);
  }, [navigate]);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'scheduled':
        return theme.palette.info.main;
      case 'maintenance':
        return theme.palette.warning.main;
      case 'offline':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const statusLabels: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    maintenance: 'Maintenance',
    active: 'Active',
    inactive: 'Inactive',
  };

  const getStatusLabel = (status: string) => statusLabels[status] || status;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Screen Map</Typography>

        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: 'info.lighter',
            border: 1,
            borderColor: 'info.light',
            mb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:info-circle-bold-duotone" width={20} sx={{ color: 'info.main' }} />
            <Typography variant="body2" color="info.darker">
              Using OpenStreetMap. Map displays screens with coordinates ({screens.length} out of {screensResponse?.results?.length || 0}).
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="body2">Online</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="body2">Maintenance</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Typography variant="body2">Offline</Typography>
          </Box>
        </Stack>

        <StyledMapContainer>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">
                Error loading screen data: {error.message || 'Unknown error'}
              </Alert>
            </Box>
          )}

          <Map
            initialViewState={{
              latitude: 41.2995,
              longitude: 69.2401,
              zoom: 6,
            }}
            mapStyle="https://tiles.stadiamaps.com/styles/osm_bright.json"
            mapboxAccessToken={MAPBOX_API}
          >
            <MapControl />

            {screens.length === 0 && !loading && !error && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  p: 3,
                  borderRadius: 2,
                  boxShadow: theme.shadows[10],
                }}
              >
                <Iconify icon="solar:map-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No screens with coordinates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add coordinates to screens to display them on the map
                </Typography>
              </Box>
            )}

            {screens.map((screen) => (
              <MapMarker
                key={screen.id}
                latitude={screen.coordinates.lat}
                longitude={screen.coordinates.lng}
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  handleMarkerClick(screen);
                }}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  sx={{
                    height: 32,
                    width: 32,
                    stroke: 'none',
                    cursor: 'pointer',
                    fill: getMarkerColor(screen.status),
                    transform: `translate(-16px, -32px)`,
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: `translate(-16px, -32px) scale(1.2)`,
                    },
                  }}
                >
                  <path d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3 c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9 C20.1,15.8,20.2,15.8,20.2,15.7z" />
                </Box>
              </MapMarker>
            ))}

            {popupInfo && (
              <MapPopup
                longitude={popupInfo.coordinates.lng}
                latitude={popupInfo.coordinates.lat}
                onClose={handlePopupClose}
                sx={{
                  '& .mapboxgl-popup-content': {
                    bgcolor: 'background.paper',
                    boxShadow: theme.customShadows.dialog,
                    borderRadius: 2,
                    p: 0,
                    maxWidth: '320px',
                    minWidth: '280px',
                  },
                  '&.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip': {
                    borderTopColor: theme.palette.background.paper,
                  },
                  '&.mapboxgl-popup-anchor-top .mapboxgl-popup-tip': {
                    borderBottomColor: theme.palette.background.paper,
                  },
                }}
              >
                <Box sx={{ p: 2, minWidth: 280, maxWidth: 320 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1">{popupInfo.name}</Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 0.75,
                          bgcolor: `${getMarkerColor(popupInfo.status)}14`,
                          color: getMarkerColor(popupInfo.status),
                          typography: 'caption',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                        }}
                      >
                        {getStatusLabel(popupInfo.status)}
                      </Box>
                    </Stack>

                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="solar:map-point-bold"
                          width={16}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {popupInfo.location}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="solar:monitor-bold"
                          width={16}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {popupInfo.type} • {popupInfo.size} • {popupInfo.resolution}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="solar:hash-bold"
                          width={16}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ID: {popupInfo.id}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.5} sx={{ pt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        onClick={() => handleViewScreenContent(popupInfo.id)}
                        sx={{
                          minWidth: 'auto',
                          px: 1.5,
                          fontSize: '0.75rem',
                        }}
                      >
                        View
                      </Button>

                    </Stack>
                  </Stack>
                </Box>
              </MapPopup>
            )}
          </Map>
        </StyledMapContainer>
      </Stack>
    </Container>
  );
}

