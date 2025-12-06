
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import ScreenNewEditForm from '../screen-new-edit-form';

export default function ScreenCreateView() {
  const settings = useSettingsContext();

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
          <Typography color="text.primary">Add Screen</Typography>
        </Breadcrumbs>

        {}
        <Stack spacing={1}>
          <Typography variant="h4">Add New Screen</Typography>
          <Chip label="New Screen" color="primary" size="small" variant="soft" sx={{ width: 'fit-content' }} />
        </Stack>

        {}
        <ScreenNewEditForm />
      </Stack>
    </Container>
  );
}

