
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';

import { useSettingsContext } from 'src/components/settings';

export default function CampaignDetailsSkeleton() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {}
        <Stack direction="row" spacing={1}>
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton variant="text" width={20} height={24} />
          <Skeleton variant="text" width={150} height={24} />
        </Stack>

        {}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Skeleton variant="text" width={300} height={36} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="text" width={100} height={24} />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={120} height={40} />
            <Skeleton variant="rounded" width={120} height={40} />
          </Stack>
        </Stack>

        {}
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid key={index} xs={12} md={3}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton variant="rounded" width={32} height={32} />
                  </Stack>
                  <Skeleton variant="text" width={100} height={32} />
                  <Skeleton variant="text" width={120} height={16} />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Skeleton variant="text" width={150} height={24} />
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Stack spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Box key={index}>
                      <Skeleton variant="text" width={120} height={16} />
                      <Skeleton variant="text" width={200} height={20} />
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid xs={12} md={6}>
                <Stack spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Box key={index}>
                      <Skeleton variant="text" width={120} height={16} />
                      <Skeleton variant="text" width={200} height={20} />
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Card>

        {}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="rounded" width="100%" height={300} />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

