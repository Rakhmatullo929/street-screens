
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

export default function MediaCardSkeleton() {
  return (
    <Card>
      {}
      <Skeleton variant="rectangular" sx={{ pt: '75%' }} />

      {}
      <Stack spacing={1} sx={{ p: 2 }}>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="rounded" width="70%" height={24} />
      </Stack>
    </Card>
  );
}

type MediaCardSkeletonGridProps = {
  count?: number;
};

export function MediaCardSkeletonGrid({ count = 8 }: MediaCardSkeletonGridProps) {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid xs={12} sm={6} md={4} lg={3} key={index}>
          <MediaCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

