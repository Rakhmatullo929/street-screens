import { useState, useCallback } from 'react';
import Map, { MapLayerMouseEvent } from 'react-map-gl';

import { styled, useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Box,
  Alert,
} from '@mui/material';

import { MAPBOX_API } from 'src/config-global';

import Iconify from 'src/components/iconify';
import MapControl from './map-control';
import MapMarker from './map-marker';

const StyledMapContainer = styled(Box)(({ theme }) => ({
  height: 500,
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
    display: 'none',
  },
}));

interface LocationPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: { address: string; lat: number; lng: number };
}

export default function LocationPickerDialog({
  open,
  onClose,
  onSelect,
  initialLocation,
}: LocationPickerDialogProps) {
  const theme = useTheme();

  
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  }>(
    initialLocation
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : { lat: 41.2995, lng: 69.2401 }
  );

  const [address, setAddress] = useState(initialLocation?.address || '');
  const [viewport, setViewport] = useState({
    latitude: initialLocation?.lat || 41.2995,
    longitude: initialLocation?.lng || 69.2401,
    zoom: initialLocation ? 14 : 11,
  });

  // Обработчик клика по карте
  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    setSelectedLocation({ lat, lng });

    // Можно добавить обратное геокодирование здесь
    // Пока просто форматируем координаты
    setAddress(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
  }, []);

  // Обработчик подтверждения
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onSelect({
        address: address || `Lat: ${selectedLocation.lat.toFixed(6)}, Lng: ${selectedLocation.lng.toFixed(6)}`,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      });
      onClose();
    }
  }, [selectedLocation, address, onSelect, onClose]);

  // Поиск по адресу (можно добавить геокодирование)
  const handleSearch = useCallback(() => {
    // Здесь можно добавить геокодирование через Mapbox API
    console.log('Search for:', address);
  }, [address]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:map-point-bold-duotone" width={24} />
          <Typography variant="h6">Выберите локацию на карте</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            Кликните на карту, чтобы выбрать локацию экрана
          </Alert>

          <TextField
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Введите адрес или кликните на карте..."
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1 }}>
                  <Iconify icon="solar:magnifer-bold" width={20} />
                </Box>
              ),
              endAdornment: (
                <Button onClick={handleSearch} size="small">
                  Найти
                </Button>
              ),
            }}
          />

          {selectedLocation && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                p: 2,
                bgcolor: 'primary.lighter',
                borderRadius: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Широта
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedLocation.lat.toFixed(6)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Долгота
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedLocation.lng.toFixed(6)}
                </Typography>
              </Box>
            </Stack>
          )}

          <StyledMapContainer>
            <Map
              {...viewport}
              onMove={(evt) => setViewport(evt.viewState)}
              onClick={handleMapClick}
              mapStyle="https://tiles.stadiamaps.com/styles/osm_bright.json"
              mapboxAccessToken={MAPBOX_API}
              style={{ width: '100%', height: '100%' }}
            >
              <MapControl hideGeolocateControl hideFullscreenControl />

              {selectedLocation && (
                <MapMarker latitude={selectedLocation.lat} longitude={selectedLocation.lng} />
              )}
            </Map>
          </StyledMapContainer>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedLocation}
          startIcon={<Iconify icon="solar:check-circle-bold" />}
        >
          Подтвердить локацию
        </Button>
      </DialogActions>
    </Dialog>
  );
}

