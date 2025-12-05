import { useEffect, useState, useMemo } from 'react';
import Map from 'react-map-gl';

import { useTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { MAPBOX_API } from 'src/config-global';

import { SCREENS } from 'src/constants/dooh-data';
import { REGION_COORDINATES } from 'src/constants/regions-data';

import MapMarker from './map-marker';

const StyledMapContainer = styled(Box)(({ theme }) => ({
  height: 350,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'default',
  '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
    display: 'none',
  },
  '& .mapboxgl-canvas': {
    cursor: 'default !important',
  },
}));

interface GeoTargetingMapProps {
  region?: string;
  district?: string;
}

export default function GeoTargetingMap({ region, district }: GeoTargetingMapProps) {
  const theme = useTheme();
  
  
  const viewport = useMemo(() => {
    
    if (region && district && REGION_COORDINATES[region]?.districts?.[district]) {
      return {
        ...REGION_COORDINATES[region].districts[district],
        zoom: 12, 
      };
    }
    
    
    if (region && REGION_COORDINATES[region]) {
      return {
        ...REGION_COORDINATES[region].center,
        zoom: 9, 
      };
    }
    
    
    return {
      latitude: 41.2995,
      longitude: 64.5853,
      zoom: 6,
    };
  }, [region, district]);

  const [viewState, setViewState] = useState(viewport);

  
  useEffect(() => {
    setViewState(viewport);
  }, [viewport]);

  
  const filteredScreens = useMemo(() => SCREENS, []);

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.main',
            }}
          />
          <Typography variant="caption" fontWeight="medium">
            Доступные экраны: {filteredScreens.filter(s => s.status === 'online').length} из {filteredScreens.length}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="caption">Online</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="caption">Maintenance</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Typography variant="caption">Offline</Typography>
          </Stack>
        </Stack>
      </Stack>

        <StyledMapContainer>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="https://tiles.stadiamaps.com/styles/osm_bright.json"
          mapboxAccessToken={MAPBOX_API}
          style={{ width: '100%', height: '100%' }}
          interactive={false}
        >
          {}
          {filteredScreens.map((screen) => (
            <MapMarker
              key={screen.id}
              latitude={screen.coordinates.lat}
              longitude={screen.coordinates.lng}
            />
          ))}
        </Map>
      </StyledMapContainer>

      {region && district && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          💡 Карта автоматически приближена к выбранной локации
        </Typography>
      )}
    </Stack>
  );
}

