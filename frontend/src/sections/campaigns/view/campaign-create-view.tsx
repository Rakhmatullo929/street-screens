
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import CampaignNewEditForm from '../campaign-new-edit-form';

export default function CampaignCreateView() {
  const settings = useSettingsContext();

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
          <Typography color="text.primary">Create Campaign</Typography>
        </Breadcrumbs>

        {}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="h4">Create Campaign</Typography>
            <Chip label="New Campaign" color="primary" size="small" variant="soft" />
          </Stack>
        </Stack>

        {}
        <CampaignNewEditForm />
      </Stack>
    </Container>
  );
}

