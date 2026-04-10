import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';

import { useApiQuery } from 'src/hooks/use-api-query';

import { API_ENDPOINTS } from 'src/utils/axios';

import type { IAudienceBreakdown, IAudienceLive } from 'src/types/ads-manager';

type Props = {
  campaignId: number | string;
};

const AGE_ORDER = ['0-17', '18-24', '25-34', '35-44', '45-54', '55+', 'unknown'];

function formatRelative(iso: string | null): string {
  if (!iso) return 'no data yet';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  return `${Math.round(seconds / 3600)}h ago`;
}

export default function AudienceAnalytics({ campaignId }: Props) {
  const { data: breakdown, loading } = useApiQuery<IAudienceBreakdown>({
    url: API_ENDPOINTS.ml.audienceByCampaign(campaignId),
    enabled: !!campaignId,
    refetchInterval: 5000,
  });

  const { data: live } = useApiQuery<IAudienceLive>({
    url: API_ENDPOINTS.ml.audienceLive,
    params: { seconds: 120 },
    refetchInterval: 5000,
  });

  const ageSeries = useMemo(() => {
    if (!breakdown) return { labels: [] as string[], values: [] as number[] };
    const entries = AGE_ORDER.filter((key) => breakdown.by_age[key]).map((key) => ({
      key,
      value: breakdown.by_age[key],
    }));
    return {
      labels: entries.map((e) => e.key),
      values: entries.map((e) => e.value),
    };
  }, [breakdown]);

  const genderSeries = useMemo(() => {
    if (!breakdown) return { labels: [] as string[], values: [] as number[] };
    const entries = Object.entries(breakdown.by_gender).filter(([, v]) => v > 0);
    return {
      labels: entries.map(([k]) => k),
      values: entries.map(([, v]) => v),
    };
  }, [breakdown]);

  const emotionSeries = useMemo(() => {
    if (!breakdown) return { labels: [] as string[], values: [] as number[] };
    const entries = Object.entries(breakdown.by_emotion).filter(([, v]) => v > 0);
    return {
      labels: entries.map(([k]) => k),
      values: entries.map(([, v]) => v),
    };
  }, [breakdown]);

  const hourlySeries = useMemo(() => {
    if (!breakdown?.hourly?.length) return { categories: [] as string[], values: [] as number[] };
    return {
      categories: breakdown.hourly.map((p) =>
        new Date(p.hour).toLocaleTimeString([], { hour: '2-digit' })
      ),
      values: breakdown.hourly.map((p) => p.count),
    };
  }, [breakdown]);

  const ageChartOptions = useChart({
    labels: ageSeries.labels,
    legend: { position: 'bottom' },
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: { fillSeriesColor: false },
    plotOptions: { pie: { donut: { size: '70%' } } },
  });

  const genderChartOptions = useChart({
    labels: genderSeries.labels,
    legend: { position: 'bottom' },
    stroke: { width: 0 },
    colors: ['#1976d2', '#ec407a', '#9e9e9e'],
    plotOptions: { pie: { donut: { size: '70%' } } },
  });

  const emotionChartOptions = useChart({
    xaxis: { categories: emotionSeries.labels },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    legend: { show: false },
  });

  const hourlyChartOptions = useChart({
    xaxis: { categories: hourlySeries.categories },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
    legend: { show: false },
    dataLabels: { enabled: false },
    markers: { size: 4 },
  });

  const hasAnyData = (breakdown?.total_impressions ?? 0) > 0;

  return (
    <Card
      sx={{
        p: 3,
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
                boxShadow: '0 4px 12px rgba(123, 31, 162, 0.25)',
              }}
            >
              <Iconify icon="solar:videocamera-record-bold-duotone" width={20} sx={{ color: 'white' }} />
            </Box>
            <Stack>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Real Audience Analytics
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Privacy-preserving CV measurement · updates every 5s
              </Typography>
            </Stack>
          </Stack>

          <Chip
            size="small"
            color={live && live.total_faces > 0 ? 'success' : 'default'}
            icon={
              <Iconify
                icon={
                  live && live.total_faces > 0
                    ? 'solar:eye-scan-bold-duotone'
                    : 'solar:eye-closed-bold-duotone'
                }
                width={16}
              />
            }
            label={
              live
                ? `Live: ${live.total_faces} faces / last ${Math.round(live.window_seconds / 60)}m`
                : 'waiting for edge agent'
            }
          />
        </Stack>

        {!hasAnyData && !loading && (
          <Box
            sx={{
              p: 5,
              textAlign: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 2,
            }}
          >
            <Iconify
              icon="solar:camera-minimalistic-bold-duotone"
              width={48}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              No audience data yet. Run <code>python edge-agent/agent.py --screen &lt;id&gt;</code> or
              <code> python manage.py seed_audience</code> to populate metrics.
            </Typography>
          </Box>
        )}

        {hasAnyData && breakdown && (
          <>
            <Grid container spacing={2}>
              <Grid xs={6} md={3}>
                <KpiCard
                  color="#7b1fa2"
                  icon="solar:users-group-two-rounded-bold-duotone"
                  label="Total Impressions"
                  value={breakdown.total_impressions.toLocaleString()}
                  caption={`last update ${formatRelative(breakdown.last_updated)}`}
                />
              </Grid>
              <Grid xs={6} md={3}>
                <KpiCard
                  color="#00897b"
                  icon="solar:user-rounded-bold-duotone"
                  label="Unique Samples"
                  value={breakdown.unique_viewers.toLocaleString()}
                  caption="distinct face detections"
                />
              </Grid>
              <Grid xs={6} md={3}>
                <KpiCard
                  color="#ef6c00"
                  icon="solar:eye-bold-duotone"
                  label="Avg Attention"
                  value={`${Math.round(breakdown.avg_attention * 100)}%`}
                  caption="0..100 focus score"
                />
              </Grid>
              <Grid xs={6} md={3}>
                <KpiCard
                  color="#1976d2"
                  icon="solar:clock-circle-bold-duotone"
                  label="Avg Dwell"
                  value={`${breakdown.avg_dwell_seconds.toFixed(1)}s`}
                  caption="time in front of screen"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  By Age
                </Typography>
                {ageSeries.values.length > 0 ? (
                  <Chart
                    type="donut"
                    series={ageSeries.values}
                    options={ageChartOptions}
                    height={260}
                  />
                ) : (
                  <EmptyMini label="no age data" />
                )}
              </Grid>

              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  By Gender
                </Typography>
                {genderSeries.values.length > 0 ? (
                  <Chart
                    type="donut"
                    series={genderSeries.values}
                    options={genderChartOptions}
                    height={260}
                  />
                ) : (
                  <EmptyMini label="no gender data" />
                )}
              </Grid>

              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  By Emotion
                </Typography>
                {emotionSeries.values.length > 0 ? (
                  <Chart
                    type="bar"
                    series={[{ name: 'Faces', data: emotionSeries.values }]}
                    options={emotionChartOptions}
                    height={260}
                  />
                ) : (
                  <EmptyMini label="no emotion data" />
                )}
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Impressions · last 24h
              </Typography>
              {hourlySeries.values.length > 0 ? (
                <Chart
                  type="area"
                  series={[{ name: 'Impressions', data: hourlySeries.values }]}
                  options={hourlyChartOptions}
                  height={280}
                />
              ) : (
                <EmptyMini label="no hourly data for the last 24 hours" />
              )}
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}

type KpiCardProps = {
  color: string;
  icon: string;
  label: string;
  value: string;
  caption?: string;
};

function KpiCard({ color, icon, label, value, caption }: KpiCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${color}14 0%, ${color}05 100%)`,
        height: '100%',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: color,
            }}
          >
            <Iconify icon={icon} width={20} sx={{ color: 'white' }} />
          </Box>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
          {value}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function EmptyMini({ label }: { label: string }) {
  return (
    <Box
      sx={{
        height: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        bgcolor: 'background.neutral',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
