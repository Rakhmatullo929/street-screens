
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';

export default function StatsCardSkeleton() {
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Skeleton variant="text" width={80} height={40} />
          <Skeleton variant="rounded" width={48} height={48} />
        </Stack>
        <Skeleton variant="text" width={120} height={20} />
      </Stack>
    </Card>
  );
}

type StatsCardSkeletonListProps = {
  count?: number;
};

export function StatsCardSkeletonList({ count = 4 }: StatsCardSkeletonListProps) {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid key={index} xs={12} sm={6} md={3}>
          <StatsCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

