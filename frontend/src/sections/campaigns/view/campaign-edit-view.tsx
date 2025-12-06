import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useApiQuery } from 'src/hooks/use-api-query';
import { useSnackbar } from 'src/components/snackbar';
import { CampaignDetailsSkeleton } from 'src/components/skeleton';

import { getStatusColor } from 'src/constants/dooh-data';

import type { IAdsManager } from 'src/types/ads-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

import CampaignNewEditForm from '../campaign-new-edit-form';

export default function CampaignEditView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  
  const handleError = useCallback((error: Error) => {
    enqueueSnackbar('Error loading campaign for editing', { variant: 'error' });
    console.error('Campaign edit loading error:', error);
  }, [enqueueSnackbar]);

  
  const {
    data: currentCampaign,
    loading,
    error
  } = useApiQuery<IAdsManager>({
    url: API_ENDPOINTS.adsManager.detail(id || ''),
    enabled: !!id,
    onError: handleError,
  });

  if (loading) {
    return <CampaignDetailsSkeleton />;
  }

  if (error || !currentCampaign) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6">Campaign not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {}
        <Breadcrumbs>
          <Link
            color="inherit"
            href="/dashboard/ads-manager"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Iconify icon="solar:home-2-bold-duotone" width={16} sx={{ mr: 0.5 }} />
            StreetScreen Manager
          </Link>
          <Typography color="text.primary">Edit Campaign</Typography>
        </Breadcrumbs>

        {}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="h4">Edit Campaign</Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={currentCampaign.status_display} 
                color={getStatusColor(currentCampaign.status)} 
                size="small" 
                variant="soft" 
              />
              <Typography variant="body2" color="text.secondary">
                {currentCampaign.campaign_name}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {}
        <CampaignNewEditForm currentCampaign={currentCampaign} isEdit />
      </Stack>
    </Container>
  );
}

