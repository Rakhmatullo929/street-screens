import { memo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

import { getStatusColor, getVenueIcon } from 'src/constants/dooh-data';

type ScreenCardProps = {
  screen: {
    id: string;
    name: string;
    location: string;
    venue: string;
    status: string;
    resolution: string;
    size: string;
    uptime: number;
    lastSeen: string;
    revenue: number;
    impressions: number;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

function getStatusGradient(statusColor: string): string {
  if (statusColor === 'success') return '#2e7d32, #4caf50';
  if (statusColor === 'warning') return '#ffab00, #ffc107';
  if (statusColor === 'error') return '#d32f2f, #f44336';
  return '#1976d2, #42a5f5';
}

function getStatusBackgroundGradient(statusColor: string): string {
  if (statusColor === 'success') return 'rgba(46, 125, 50, 0.08), rgba(76, 175, 80, 0.04)';
  if (statusColor === 'warning') return 'rgba(255, 171, 0, 0.08), rgba(255, 193, 7, 0.04)';
  if (statusColor === 'error') return 'rgba(211, 47, 47, 0.08), rgba(244, 67, 54, 0.04)';
  return 'rgba(25, 118, 210, 0.08), rgba(66, 165, 245, 0.04)';
}

function ScreenCard({ screen, onView, onEdit, onMenuClick }: ScreenCardProps) {
  const statusColor = getStatusColor(screen.status);
  const isOnline = screen.status === 'online';
  const gradientColors = getStatusGradient(statusColor);
  const backgroundGradient = getStatusBackgroundGradient(statusColor);
  
  const boxShadow = isOnline 
    ? '0 4px 20px rgba(46, 125, 50, 0.15)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)';
  
  const hoverBoxShadow = isOnline
    ? '0 12px 40px rgba(46, 125, 50, 0.25)'
    : '0 12px 40px rgba(0, 0, 0, 0.15)';
  
  const borderColor = isOnline ? 'success.light' : 'divider';
  const hoverBorderColor = isOnline ? 'success.main' : 'primary.main';
  
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
        border: '2px solid',
        borderColor,
        borderRadius: 3,
        boxShadow,
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
          boxShadow: hoverBoxShadow,
          borderColor: hoverBorderColor,
        },
      }}
    >
      <Stack spacing={2.5} sx={{ flex: 1 }}>
        {}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
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
              <Iconify icon={getVenueIcon(screen.venue)} width={28} sx={{ color: 'white' }} />
            </Box>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
                noWrap
              >
                {screen.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {screen.venue}
              </Typography>
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
            background: `linear-gradient(135deg, ${backgroundGradient})`,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Chip
                size="small"
                label={screen.status}
                color={statusColor}
                sx={{ 
                  height: 28,
                  fontWeight: 600,
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isOnline ? 'success.main' : 'error.main',
                    animation: isOnline ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {screen.uptime}% uptime
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:map-point-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {screen.location}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {}
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Specifications
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:monitor-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {screen.size}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:display-bold-duotone" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {screen.resolution}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.04) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Performance
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  ${screen.revenue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Revenue
                </Typography>
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {(screen.impressions / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Impressions
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {}
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          Last seen: {new Date(screen.lastSeen).toLocaleString()}
        </Typography>
      </Stack>
    </Card>
  );
}

export default memo(ScreenCard);
