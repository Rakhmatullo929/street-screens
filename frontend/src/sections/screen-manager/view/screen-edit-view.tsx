import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useApiQuery } from 'src/hooks/use-api-query';

import type { IScreenManager } from 'src/types/screen-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

import ScreenNewEditForm from '../screen-new-edit-form';

export default function ScreenEditView() {
  const settings = useSettingsContext();
  const { id } = useParams();

  
  const { 
    data: currentScreen, 
    loading, 
    error 
  } = useApiQuery<IScreenManager>({
    url: API_ENDPOINTS.screenManager.detail(id || ''),
    enabled: !!id,
  });

  // Transform backend data to frontend format for the form
  const transformedScreen = currentScreen ? {
    id: currentScreen.id.toString(),
    title: currentScreen.title,
    position: currentScreen.position,
    location: currentScreen.location,
    coordinates: currentScreen.coordinates,
    type_category: currentScreen.type_category,
    status: currentScreen.status,
    screen_resolution: currentScreen.screen_resolution,
    screen_size: currentScreen.screen_size,
    region: currentScreen.region,
    district: currentScreen.district,
    // Map backend status to frontend display format for compatibility
    name: currentScreen.title,
    venue: currentScreen.type_category,
    // Add geoTarget structure for the form
    geoTarget: {
      region: currentScreen.region?.id || null,
      district: currentScreen.district?.id || null,
    },
  } : null;

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={20} height={24} />
            <Skeleton variant="text" width={180} height={24} />
          </Stack>
          <Stack spacing={1}>
            <Skeleton variant="text" width={280} height={36} />
            <Skeleton variant="rounded" width={120} height={24} />
          </Stack>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Skeleton variant="text" width={200} height={24} />
              <Skeleton variant="rounded" width="100%" height={56} />
              <Skeleton variant="rounded" width="100%" height={56} />
            </Stack>
          </Card>
        </Stack>
      </Container>
    );
  }

  if (error || (!loading && !currentScreen)) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Typography variant="h6">Screen Not Found</Typography>
          <Typography variant="body2" color="text.secondary">
            {error ? 'Error loading screen data' : 'Screen with the specified ID does not exist'}
          </Typography>
        </Stack>
      </Container>
    );
  }

  if (!transformedScreen) {
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
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Iconify icon="solar:home-2-bold-duotone" width={16} sx={{ mr: 0.5 }} />
            Screen Manager
          </Link>
          <Typography color="text.primary">Edit Screen</Typography>
        </Breadcrumbs>

        {}
        <Stack spacing={1}>
          <Typography variant="h4">Edit Screen</Typography>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={transformedScreen.status} 
              color={(() => {
                if (transformedScreen.status === 'active') return 'success';
                if (transformedScreen.status === 'maintenance') return 'warning';
                return 'error';
              })()} 
              size="small" 
              variant="soft" 
            />
            <Typography variant="body2" color="text.secondary">
              {transformedScreen.title}
            </Typography>
          </Stack>
        </Stack>

        {}
        <ScreenNewEditForm currentScreen={transformedScreen} isEdit />
      </Stack>
    </Container>
  );
}

