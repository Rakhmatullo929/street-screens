import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
import { useApiQuery } from 'src/hooks/use-api-query';
import { useApi } from 'src/hooks/use-api';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { CampaignCard } from 'src/components/cards';
import { CampaignCardSkeletonList, StatsCardSkeletonList } from 'src/components/skeleton';
import EmptyContent from 'src/components/empty-content';

import { paths } from 'src/routes/paths';

import type { 
  IAdsManager, 
  IAdsManagerStatus, 
  IAdsManagerStats, 
  IAdsManagerAggregate, 
  IAdsManagerListParams, 
  IAdsManagerListResponse,
  ITransformedAdsManager
} from 'src/types/ads-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

import { convertBackendScheduleToCalendar } from 'src/constants/dooh-data';

export default function AdsManagerView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const popover = usePopover();
  const confirmDelete = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const [filterStatus, setFilterStatus] = useState<IAdsManagerStatus | 'all'>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  
  const queryParams = useMemo((): IAdsManagerListParams => ({
    status: filterStatus === 'all' ? undefined : filterStatus as IAdsManagerStatus,
    ordering: '-created_at',
  }), [filterStatus]);

  
  const handleCampaignsError = useCallback((error: Error) => {
    enqueueSnackbar('Error loading campaigns', { variant: 'error' });
    console.error('Campaigns loading error:', error);
  }, [enqueueSnackbar]);

  const handleStatsError = useCallback((error: Error) => {
    console.error('Stats loading error:', error);
  }, []);

  
  const {
    data: campaignsResponse,
    loading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns
  } = useApiQuery<IAdsManagerListResponse>({
    url: API_ENDPOINTS.adsManager.list,
    params: queryParams,
    onError: handleCampaignsError,
  });

  
  const campaignsData = useMemo(() => {
    if (!campaignsResponse) return [];
    
    return campaignsResponse.results || [];
  }, [campaignsResponse]);

  
  const {
    data: statsData,
    loading: statsLoading
  } = useApiQuery<IAdsManagerStats>({
    url: API_ENDPOINTS.adsManager.stats,
    onError: handleStatsError,
  });

  
  const {
    data: aggregateData,
    loading: aggregateLoading,
    refetch: refetchAggregate
  } = useApiQuery<IAdsManagerAggregate>({
    url: API_ENDPOINTS.adsManager.aggregateByStatus,
    onError: handleStatsError,
  });

  
  const { execute: deleteCampaign, loading: deleteLoading } = useApi({
    url: '', // Will be set dynamically
    method: 'DELETE',
    onSuccess: () => {
      enqueueSnackbar('Campaign deleted successfully!', { variant: 'success' });
      refetchCampaigns();
      refetchAggregate();
      confirmDelete.onFalse();
      setSelectedCampaignId(null);
    },
    onError: (error) => {
      enqueueSnackbar('Error deleting campaign', { variant: 'error' });
      console.error('Delete error:', error);
    },
  });

  
  const formatUnavailableData = <T,>(value: T | null | undefined): T | '-' => 
    value !== null && value !== undefined ? value : '-';

  
  const campaigns = useMemo((): ITransformedAdsManager[] => {
    if (!campaignsData) return [];

    return campaignsData.map((campaign): ITransformedAdsManager => ({
      id: campaign.id.toString(),
      name: campaign.campaign_name,
      status: campaign.status,
      budget: campaign.budget,
      spent: null, 
      impressions: null, 
      clicks: null, 
      ctr: null, 
      venues: campaign.venue_types?.length || 0,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      creative: campaign.campaign_name, 
      schedule: convertBackendScheduleToCalendar(campaign.schedule),
      geoTarget: {
        region: campaign.region?.name || '',
        district: campaign.district?.name || '',
      },
      displayDuration: 15, // Default duration
      contentType: 'video' as const,
      contentFiles: [] as readonly string[],
    }));
  }, [campaignsData]);

  
  const stats = useMemo(() => {
    if (!aggregateData) {
      return {
        active: 0,
        draft: 0,
        paused: 0,
        completed: 0,
        totalBudget: 0,
        totalCampaigns: 0,
      };
    }

    
    let activeCount = 0;
    let draftCount = 0;
    let pausedCount = 0;
    let completedCount = 0;
    let totalBudget = 0;

    aggregateData.status_groups.forEach(group => {
      totalBudget += group.total_budget;
      switch (group.status) {
        case 'active':
          activeCount = group.count;
          break;
        case 'draft':
          draftCount = group.count;
          break;
        case 'paused':
          pausedCount = group.count;
          break;
        case 'completed':
          completedCount = group.count;
          break;
        default:
          break;
      }
    });

    return {
      active: activeCount,
      draft: draftCount,
      paused: pausedCount,
      completed: completedCount,
      totalBudget,
      totalCampaigns: aggregateData.total,
    };
  }, [aggregateData]);

  const loading = campaignsLoading || statsLoading || aggregateLoading;

  
  const handleFilterStatus = useCallback((status: string) => {
    setFilterStatus(status as IAdsManagerStatus | 'all');
  }, []);

  const handleViewCampaign = useCallback(
    (id: string) => {
      navigate(paths.dashboard.campaigns.view(id));
    },
    [navigate]
  );

  const handleEditCampaign = useCallback(
    (id: string) => {
      navigate(paths.dashboard.campaigns.edit(id));
    },
    [navigate]
  );

  const handleCreateCampaign = useCallback(() => {
    navigate(paths.dashboard.campaigns.create);
  }, [navigate]);

  const handleOpenDeleteDialog = useCallback(
    (id: string) => {
      setSelectedCampaignId(id);
      confirmDelete.onTrue();
      popover.onClose();
    },
    [confirmDelete, popover]
  );

  const handleDeleteCampaign = useCallback(() => {
    if (selectedCampaignId) {
      deleteCampaign({ url: API_ENDPOINTS.adsManager.delete(selectedCampaignId) });
    }
  }, [selectedCampaignId, deleteCampaign]);

  const handleDuplicateCampaign = useCallback((id: string) => {
    console.log('Duplicate campaign:', id);
    enqueueSnackbar('Кампания успешно дублирована!', { variant: 'success' });
    popover.onClose();
  }, [enqueueSnackbar, popover]);

  
  const renderCampaignsContent = useCallback(() => {
    if (loading) {
      return <CampaignCardSkeletonList count={3} />;
    }

    if (campaigns.length === 0) {
      return (
        <EmptyContent
          filled
          title="No Campaigns Found"
          description={
            filterStatus !== 'all'
              ? "No campaigns found with the selected status. Try changing the filter."
              : "You don't have any campaigns yet. Create your first campaign to get started."
          }
          action={
            filterStatus !== 'all' ? null : (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                onClick={handleCreateCampaign}
                sx={{ mt: 2 }}
              >
                Create First Campaign
              </Button>
            )
          }
          sx={{ py: 10 }}
        />
      );
    }

    return (
      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid xs={12} md={6} lg={4} key={campaign.id}>
            <CampaignCard
              campaign={campaign}
              onMenuClick={(event) => {
                setSelectedCampaignId(campaign.id);
                popover.onOpen(event);
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }, [
    loading,
    campaigns,
    filterStatus,
    handleCreateCampaign,
    popover,
  ]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
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
            Ads Manager
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
            onClick={handleCreateCampaign}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              },
            }}
          >
            Create Campaign
          </Button>
        </Stack>

        {}
        {loading ? (
          <StatsCardSkeletonList count={4} />
        ) : (
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
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
                    <Typography 
                      variant="h3"
                      sx={{ 
                        fontWeight: 700,
                        color: '#1976d2',
                      }}
                    >
                      {stats.active}
                    </Typography>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      }}
                    >
                      <Iconify icon="solar:rocket-2-bold-duotone" width={28} sx={{ color: 'white' }} />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Active Campaigns
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
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
                    <Typography 
                      variant="h3"
                      sx={{ 
                        fontWeight: 700,
                        color: '#00b8d9',
                      }}
                    >
                      {stats.totalCampaigns}
                    </Typography>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #00b8d9 0%, #00acc1 100%)',
                        boxShadow: '0 4px 12px rgba(0, 184, 217, 0.3)',
                      }}
                    >
                      <Iconify icon="solar:monitor-bold-duotone" width={28} sx={{ color: 'white' }} />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Total Campaigns
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
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
                    <Typography 
                      variant="h3"
                      sx={{ 
                        fontWeight: 700,
                        color: '#ffab00',
                      }}
                    >
                      {stats.draft}
                    </Typography>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #ffab00 0%, #ffc107 100%)',
                        boxShadow: '0 4px 12px rgba(255, 171, 0, 0.3)',
                      }}
                    >
                      <Iconify icon="solar:file-text-bold-duotone" width={28} sx={{ color: 'white' }} />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Draft Campaigns
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
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
                    <Typography 
                      variant="h3"
                      sx={{ 
                        fontWeight: 700,
                        color: '#2e7d32',
                      }}
                    >
                      ${(stats.totalBudget / 1000).toFixed(0)}K
                    </Typography>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                      }}
                    >
                      <Iconify icon="solar:dollar-minimalistic-bold-duotone" width={28} sx={{ color: 'white' }} />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Total Budget
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {}
        <Card 
          sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.02) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
              Filter by Status:
            </Typography>
            <Chip
              label="All"
              onClick={() => handleFilterStatus('all')}
              sx={{
                background: filterStatus === 'all' 
                  ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                  : 'transparent',
                color: filterStatus === 'all' ? 'white' : 'inherit',
                fontWeight: filterStatus === 'all' ? 600 : 400,
                border: filterStatus === 'all' ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  background: filterStatus === 'all' 
                    ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                    : 'action.hover',
                },
              }}
            />
            <Chip
              label="Active"
              onClick={() => handleFilterStatus('active')}
              sx={{
                background: filterStatus === 'active' 
                  ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                  : 'transparent',
                color: filterStatus === 'active' ? 'white' : 'inherit',
                fontWeight: filterStatus === 'active' ? 600 : 400,
                border: filterStatus === 'active' ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  background: filterStatus === 'active' 
                    ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)'
                    : 'action.hover',
                },
              }}
            />
            <Chip
              label="Draft"
              onClick={() => handleFilterStatus('draft')}
              sx={{
                background: filterStatus === 'draft' 
                  ? 'linear-gradient(135deg, #ffab00 0%, #ffc107 100%)'
                  : 'transparent',
                color: filterStatus === 'draft' ? 'white' : 'inherit',
                fontWeight: filterStatus === 'draft' ? 600 : 400,
                border: filterStatus === 'draft' ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  background: filterStatus === 'draft' 
                    ? 'linear-gradient(135deg, #f57c00 0%, #ffab00 100%)'
                    : 'action.hover',
                },
              }}
            />
            <Chip
              label="Paused"
              onClick={() => handleFilterStatus('paused')}
              sx={{
                background: filterStatus === 'paused' 
                  ? 'linear-gradient(135deg, #00b8d9 0%, #00acc1 100%)'
                  : 'transparent',
                color: filterStatus === 'paused' ? 'white' : 'inherit',
                fontWeight: filterStatus === 'paused' ? 600 : 400,
                border: filterStatus === 'paused' ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  background: filterStatus === 'paused' 
                    ? 'linear-gradient(135deg, #0097a7 0%, #00b8d9 100%)'
                    : 'action.hover',
                },
              }}
            />
            <Chip
              label="Completed"
              onClick={() => handleFilterStatus('completed')}
              sx={{
                background: filterStatus === 'completed' 
                  ? 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)'
                  : 'transparent',
                color: filterStatus === 'completed' ? 'white' : 'inherit',
                fontWeight: filterStatus === 'completed' ? 600 : 400,
                border: filterStatus === 'completed' ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  background: filterStatus === 'completed' 
                    ? 'linear-gradient(135deg, #6a1b9a 0%, #7b1fa2 100%)'
                    : 'action.hover',
                },
              }}
            />
          </Stack>
        </Card>

        {}
        {renderCampaignsContent()}
      </Stack>

      {}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            if (selectedCampaignId) {
              handleViewCampaign(selectedCampaignId);
            }
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Просмотр
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedCampaignId) {
              handleEditCampaign(selectedCampaignId);
            }
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Редактировать
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedCampaignId) {
              handleDuplicateCampaign(selectedCampaignId);
            }
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Дублировать
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedCampaignId) {
              handleOpenDeleteDialog(selectedCampaignId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Удалить
        </MenuItem>
      </CustomPopover>

      {}
      <Dialog open={confirmDelete.value} onClose={confirmDelete.onFalse}>
        <DialogTitle>Удалить кампанию?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту кампанию? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDelete.onFalse} variant="outlined" color="inherit">
            Отмена
          </Button>
          <Button onClick={handleDeleteCampaign} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
