
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';

export default function CampaignCardSkeleton() {
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: '2px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2.5}>
        {}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 2 }} />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Stack>
          </Stack>
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>

        {}
        <Skeleton variant="rounded" width="100%" height={80} sx={{ borderRadius: 2 }} />

        {}
        <Stack spacing={1.5}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="70%" height={16} />
          <Skeleton variant="text" width="50%" height={16} />
        </Stack>

        {}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
          <Skeleton variant="text" width={100} height={14} />
        </Stack>
      </Stack>
    </Card>
  );
}

type CampaignCardSkeletonListProps = {
  count?: number;
};

export function CampaignCardSkeletonList({ count = 3 }: CampaignCardSkeletonListProps) {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid xs={12} md={6} lg={4} key={index}>
          <CampaignCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

