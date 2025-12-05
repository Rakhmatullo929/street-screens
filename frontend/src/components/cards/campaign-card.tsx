import { memo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

import { getStatusColor, WeeklySchedule, GeoTarget } from 'src/constants/dooh-data';
import { getRegionLabel, getDistrictLabel } from 'src/constants/regions-data';

type CampaignCardProps = {
  campaign: {
    id: string;
    name: string;
    status: string;
    budget: number;
    spent: number | null;
    impressions: number | null;
    clicks: number | null;
    ctr: number | null;
    venues: number;
    startDate: string;
    endDate: string;
    creative: string;
    ageRange?: [number, number];
    schedule?: WeeklySchedule;
    geoTarget?: GeoTarget;
    displayDuration?: 5 | 10 | 15;
    contentType?: 'video' | 'image';
    contentFiles?: readonly string[];
  };
  onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

function getStatusGradient(statusColor: string): string {
  if (statusColor === 'success') return '#2e7d32, #4caf50';
  if (statusColor === 'warning') return '#ffab00, #ffc107';
  if (statusColor === 'error') return '#d32f2f, #f44336';
  return '#1976d2, #42a5f5';
}

function CampaignCard({ campaign, onMenuClick }: CampaignCardProps) {
  const statusColor = getStatusColor(campaign.status);
  const gradientColors = getStatusGradient(statusColor);
  
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${gradientColors})`,
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack spacing={2.5} sx={{ flex: 1 }}>
        {}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${gradientColors})`,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                }}
              >
                <Iconify icon="solar:rocket-2-bold-duotone" width={28} sx={{ color: 'white' }} />
              </Box>
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: 'text.primary',
                  }}
                >
                  {campaign.name}
                </Typography>
                <Chip
                  size="small"
                  label={campaign.status}
                  color={statusColor}
                  sx={{ 
                    height: 24,
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                />
              </Stack>
            </Stack>
          </Stack>

          <IconButton 
            size="small" 
            onClick={onMenuClick}
            sx={{
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Iconify icon="eva:more-vertical-fill" width={20} />
          </IconButton>
        </Stack>

        {}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.04) 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Budget
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                ${campaign.budget.toLocaleString()}
              </Typography>
            </Stack>
            <Stack spacing={0.5} alignItems="flex-end">
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Venues
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {campaign.venues}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {}
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:calendar-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </Typography>
            </Stack>
            
            {campaign.schedule && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:clock-circle-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {getScheduleDescription(campaign.schedule)}
                </Typography>
              </Stack>
            )}
            
            {campaign.geoTarget && campaign.geoTarget.region && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:map-point-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {getDistrictLabel(campaign.geoTarget.region, campaign.geoTarget.district)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>

        {}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify 
              icon={campaign.contentType === 'video' ? 'solar:video-library-bold-duotone' : 'solar:image-bold-duotone'} 
              width={18}
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {campaign.contentType === 'video' ? 'Video' : 'Image'}
              {campaign.displayDuration && ` • ${campaign.displayDuration}s`}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

function getScheduleDescription(schedule: WeeklySchedule): string {
  const totalSlots = Object.values(schedule).filter(Boolean).length;
  const percentage = ((totalSlots / (7 * 24)) * 100).toFixed(0);
  
  if (totalSlots === 168) return '24/7';
  if (totalSlots === 0) return 'No schedule';
  
  
  const isBusinessDays = checkBusinessDays(schedule);
  const isEvening = checkEveningHours(schedule);
  const isWeekend = checkWeekend(schedule);
  
  if (isBusinessDays) return 'Business hours';
  if (isEvening) return 'Evening hours';
  if (isWeekend) return 'Weekend only';
  
  return `${percentage}% coverage`;
}

function checkBusinessDays(schedule: WeeklySchedule): boolean {
  for (let day = 1; day <= 5; day += 1) {
    for (let hour = 9; hour <= 17; hour += 1) {
      if (!schedule[`${day}-${hour}`]) return false;
    }
  }
  return true;
}

function checkEveningHours(schedule: WeeklySchedule): boolean {
  for (let day = 0; day <= 6; day += 1) {
    for (let hour = 18; hour <= 22; hour += 1) {
      if (!schedule[`${day}-${hour}`]) return false;
    }
  }
  return true;
}

function checkWeekend(schedule: WeeklySchedule): boolean {
  for (let day = 0; day <= 6; day += 1) {
    if (day === 0 || day === 6) { 
      for (let hour = 10; hour <= 21; hour += 1) {
        if (!schedule[`${day}-${hour}`]) return false;
      }
    }
  }
  return true;
}

export default memo(CampaignCard);
