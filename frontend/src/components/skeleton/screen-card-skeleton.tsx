
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

export default function ScreenCardSkeleton() {
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Skeleton variant="circular" width={48} height={48} />
            <Stack spacing={1}>
              <Skeleton variant="text" width={180} height={20} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={70} height={20} />
                <Skeleton variant="text" width={100} height={16} />
              </Stack>
            </Stack>
          </Stack>
          <Skeleton variant="circular" width={40} height={40} />
        </Stack>

        {}
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="text" width={60} height={16} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="text" width={80} height={16} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={90} height={16} />
            <Skeleton variant="text" width={70} height={16} />
          </Stack>
        </Stack>

        {}
        <Skeleton variant="rounded" width="100%" height={36} />
      </Stack>
    </Card>
  );
}

type ScreenCardSkeletonGridProps = {
  count?: number;
};

export function ScreenCardSkeletonGrid({ count = 6 }: ScreenCardSkeletonGridProps) {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid xs={12} sm={6} md={4} key={index}>
          <ScreenCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

