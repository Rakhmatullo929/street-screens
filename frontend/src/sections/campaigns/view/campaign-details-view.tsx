import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';

import { useSettingsContext } from 'src/components/settings';
import { useApiQuery } from 'src/hooks/use-api-query';

import Iconify from 'src/components/iconify';
import { CampaignDetailsSkeleton } from 'src/components/skeleton';
import { ScheduleVisualization } from 'src/components/schedule';
import { WeeklySchedule } from 'src/components/schedule/weekly-schedule-calendar';
import { useSnackbar } from 'src/components/snackbar';

import { getStatusColor, convertBackendScheduleToCalendar } from 'src/constants/dooh-data';

import { paths } from 'src/routes/paths';

import type { IAdsManager } from 'src/types/ads-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

export default function CampaignDetailsView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  
  const handleError = useCallback((error: Error) => {
    enqueueSnackbar('Error loading campaign details', { variant: 'error' });
    console.error('Campaign details loading error:', error);
  }, [enqueueSnackbar]);

  
  const {
    data: campaign,
    loading,
    error
  } = useApiQuery<IAdsManager>({
    url: API_ENDPOINTS.adsManager.detail(id || ''),
    enabled: !!id,
    onError: handleError,
  });

  if (loading) {
    return <CampaignDetailsSkeleton />;
  }

  if (error || !campaign) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h6">Campaign not found</Typography>
      </Container>
    );
  }

  
  

  
  const calendarSchedule = convertBackendScheduleToCalendar(campaign.schedule);

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
          <Typography color="text.primary">Campaign Details</Typography>
        </Breadcrumbs>

        {}
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          sx={{
            p: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.5}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {campaign.campaign_name}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label={campaign.status_display}
                color={getStatusColor(campaign.status)}
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  height: 32,
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:monitor-bold-duotone" width={18} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {campaign.venue_types?.length || 0} venues
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => navigate(paths.dashboard.campaigns.edit(campaign.id.toString()))}
              sx={{
                borderWidth: 2,
                fontWeight: 600,
                '&:hover': {
                  borderWidth: 2,
                  background: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:chart-2-bold" />}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                },
              }}
            >
              Analytics
            </Button>
          </Stack>
        </Stack>

        {}
        <Grid container spacing={3}>
          <Grid xs={12} md={3}>
            <Card 
              sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, rgba(255, 171, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(255, 171, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 16px rgba(255, 171, 0, 0.2)',
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Budget
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #ffab00 0%, #ffc107 100%)',
                      boxShadow: '0 4px 12px rgba(255, 171, 0, 0.3)',
                    }}
                  >
                    <Iconify
                      icon="solar:dollar-minimalistic-bold-duotone"
                      width={24}
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffab00' }}>
                  ${campaign.budget.toLocaleString()}
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Spent
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary">
                      -
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 171, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#ffab00',
                      },
                    }}
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} md={3}>
            <Card 
              sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)',
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Impressions
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                    }}
                  >
                    <Iconify
                      icon="solar:eye-bold-duotone"
                      width={24}
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>-</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="eva:trending-up-fill" width={16} sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                    -
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} md={3}>
            <Card 
              sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.1) 0%, rgba(0, 184, 217, 0.05) 100%)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0, 184, 217, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 16px rgba(0, 184, 217, 0.2)',
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Clicks
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #00b8d9 0%, #00acc1 100%)',
                      boxShadow: '0 4px 12px rgba(0, 184, 217, 0.3)',
                    }}
                  >
                    <Iconify
                      icon="solar:cursor-bold-duotone"
                      width={24}
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#00b8d9' }}>-</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    CTR: -
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} md={3}>
            <Card 
              sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Venues
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    }}
                  >
                    <Iconify
                      icon="solar:monitor-bold-duotone"
                      width={24}
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {campaign.venue_types?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Active Screens
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {}
        <Card 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack spacing={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Campaign Details
            </Typography>

            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Placement Period
                    </Typography>
                    <Typography variant="body1">
                      {new Date(campaign.start_date).toLocaleDateString('ru-RU')} -{' '}
                      {new Date(campaign.end_date).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Creative
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:file-bold-duotone" width={20} />
                      <Typography variant="body1">{campaign.campaign_name}</Typography>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      label={campaign.status_display}
                      color={getStatusColor(campaign.status)}
                      size="medium"
                    />
                  </Box>
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CPM (cost per 1000 impressions)
                    </Typography>
                    <Typography variant="body1">
                      -
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CPC (cost per click)
                    </Typography>
                    <Typography variant="body1">
                      -
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Reach
                    </Typography>
                    <Typography variant="body1">
                      - unique impressions
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Card>

        {}
        <Card 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                }}
              >
                <Iconify icon="solar:users-group-rounded-bold-duotone" width={20} sx={{ color: 'white' }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Audience Targeting
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {}
              <Grid xs={12} md={6}>
                <Box
                  sx={{
                    p: 2.5,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    opacity: 0.6,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(250, 250, 250, 0.5) 100%)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:user-id-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle2">Age Range</Typography>
                      <Chip
                        label="Coming Soon"
                        color="warning"
                        size="small"
                        variant="soft"
                        sx={{ ml: 'auto' }}
                      />
                    </Stack>
                    <Typography variant="h5" color="text.disabled">
                      Feature in development
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              {}
              {campaign.region && campaign.district && (
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(0, 184, 217, 0.05) 0%, rgba(0, 184, 217, 0.02) 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 184, 217, 0.15)',
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:map-point-bold-duotone" width={20} sx={{ color: 'info.main' }} />
                        <Typography variant="subtitle2">Geotargeting</Typography>
                      </Stack>
                      
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'info.lighter',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'info.light',
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="solar:map-bold" width={16} sx={{ color: 'info.main' }} />
                            <Typography variant="body2" color="info.darker" fontWeight="600">
                              {campaign.region.name}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1} pl={3}>
                            <Iconify icon="solar:point-on-map-bold" width={14} sx={{ color: 'info.dark' }} />
                            <Typography variant="body2" color="info.dark">
                              {campaign.district.name}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              )}

              {}
              {campaign.interests && campaign.interests.length > 0 && (
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255, 171, 0, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 171, 0, 0.15)',
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:star-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
                        <Typography variant="subtitle2">Audience Interests</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {campaign.interests.map((interest) => (
                          <Chip key={interest.id} label={interest.name} size="small" variant="soft" color="warning" />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              )}

              {}
              {campaign.venue_types && campaign.venue_types.length > 0 && (
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:buildings-2-bold-duotone" width={20} sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle2">Venue Types</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {campaign.venue_types.map((type) => (
                          <Chip key={type.id} label={type.name} size="small" variant="soft" color="success" />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Stack>
        </Card>

        {}
        {campaign.schedule && Object.values(campaign.schedule).some(hours => Array.isArray(hours) && hours.length > 0) && (
          <Card 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
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
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                    }}
                  >
                    <Iconify icon="solar:clock-circle-bold-duotone" width={20} sx={{ color: 'white' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Display Schedule
                  </Typography>
                </Stack>
                <Chip
                  label={`${Object.values(calendarSchedule).filter(Boolean).length}/168 slots (${((Object.values(calendarSchedule).filter(Boolean).length / 168) * 100).toFixed(1)}%)`}
                  color="primary"
                  variant="soft"
                />
              </Stack>

              <ScheduleVisualization schedule={calendarSchedule} />
            </Stack>
          </Card>
        )}

        {}
        <Card 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack spacing={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Performance
            </Typography>
            <Box
              sx={{
                p: 5,
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
              }}
            >
              <Iconify
                icon="solar:chart-2-bold-duotone"
                width={48}
                sx={{ color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Performance chart will be here
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

