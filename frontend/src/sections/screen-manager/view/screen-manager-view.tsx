import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
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
import { ScreenCard } from 'src/components/cards';
import { ScreenCardSkeletonGrid, StatsCardSkeletonList } from 'src/components/skeleton';
import EmptyContent from 'src/components/empty-content';

import { paths } from 'src/routes/paths';

import { getStatusColor, getVenueIcon } from 'src/constants/dooh-data';

import type { IScreenManager, IScreenManagerStats, IScreenManagerAggregate, IScreenManagerStatus, IScreenManagerListParams, IScreenManagerListResponse } from 'src/types/screen-manager';

import { API_ENDPOINTS } from 'src/utils/axios';

export default function ScreenManagerView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const popover = usePopover();
  const confirmDelete = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<IScreenManagerStatus | 'all'>('all');
  const [selectedScreenId, setSelectedScreenId] = useState<number | string | null>(null);
  
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  
  const queryParams = useMemo((): IScreenManagerListParams => ({
    search: debouncedSearchTerm || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus as IScreenManagerStatus,
    ordering: '-created_at',
  }), [debouncedSearchTerm, filterStatus]);

  
  const handleScreensError = useCallback((error: any) => {
    enqueueSnackbar('Error loading screens', { variant: 'error' });
    console.error('Screens loading error:', error);
  }, [enqueueSnackbar]);

  const handleStatsError = useCallback((error: any) => {
    console.error('Stats loading error:', error);
  }, []);

  
  const { 
    data: screensResponse, 
    loading: screensLoading, 
    error: screensError, 
    refetch: refetchScreens 
  } = useApiQuery<IScreenManagerListResponse>({
    url: API_ENDPOINTS.screenManager.list,
    params: queryParams,
    onError: handleScreensError,
  });

  
  const screensData = useMemo(() => {
    if (!screensResponse) return [];
    
    return screensResponse.results || [];
  }, [screensResponse]);

  
  const { 
    data: statsData, 
    loading: statsLoading 
  } = useApiQuery<IScreenManagerStats>({
    url: API_ENDPOINTS.screenManager.stats,
    onError: handleStatsError,
  });

  
  const { 
    data: aggregateData, 
    loading: aggregateLoading,
    refetch: refetchAggregate
  } = useApiQuery<IScreenManagerAggregate>({
    url: API_ENDPOINTS.screenManager.aggregateByStatus,
    onError: handleStatsError,
  });

  
  const { execute: deleteScreen, loading: deleteLoading } = useApi({
    url: '', // Will be set dynamically
    method: 'DELETE',
    onSuccess: () => {
      enqueueSnackbar('Screen deleted successfully!', { variant: 'success' });
      refetchScreens();
      refetchAggregate();
      confirmDelete.onFalse();
      setSelectedScreenId(null);
    },
    onError: (error) => {
      enqueueSnackbar('Error deleting screen', { variant: 'error' });
      console.error('Delete error:', error);
    },
  });

  
  const mapBackendStatusToFrontend = useCallback((backendStatus: IScreenManagerStatus): string => {
    if (backendStatus === 'active') return 'online';
    if (backendStatus === 'inactive') return 'offline';
    return backendStatus;
  }, []);

  
  const screens = useMemo(() => {
    if (!screensData) return [];
    
    return screensData.map((screen): any => ({
      id: screen.id.toString(),
      name: screen.title,
      location: screen.position,
      venue: screen.type_category,
      status: mapBackendStatusToFrontend(screen.status),
      resolution: screen.screen_resolution ? `${screen.screen_resolution}x1080` : '1920x1080', 
      size: screen.screen_size,
      uptime: 95.0, 
      lastSeen: screen.updated_at,
      revenue: Math.floor(Math.random() * 1000) + 500, 
      impressions: Math.floor(Math.random() * 50000) + 10000, 
    }));
  }, [screensData, mapBackendStatusToFrontend]);

  
  const stats = useMemo(() => {
    if (!aggregateData) {
      return {
        totalScreens: 0,
        onlineScreens: 0,
        inactiveScreens: 0,
        maintenanceScreens: 0,
        totalImpressions: 0,
        totalRevenue: 0,
      };
    }

    
    let activeCount = 0;
    let inactiveCount = 0;
    let maintenanceCount = 0;

    aggregateData.status_groups.forEach(group => {
      switch (group.status) {
        case 'active': 
          activeCount = group.count;
          break;
        case 'inactive': 
          inactiveCount = group.count;
          break;
        case 'maintenance': 
          maintenanceCount = group.count;
          break;
        default:
          
          break;
      }
    });

    return {
      totalScreens: aggregateData.total,
      onlineScreens: activeCount,
      inactiveScreens: inactiveCount,
      maintenanceScreens: maintenanceCount,
      totalImpressions: Math.floor(Math.random() * 1000000) + 500000, 
      totalRevenue: Math.floor(Math.random() * 10000) + 5000, 
    };
  }, [aggregateData]);

  const loading = screensLoading || statsLoading || aggregateLoading;

  
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleFilterChange = useCallback((status: string) => {
    setFilterStatus(status as IScreenManagerStatus | 'all');
  }, []);

  const handleViewScreen = useCallback(
    (id: string) => {
      navigate(paths.dashboard.screens.view(id));
    },
    [navigate]
  );

  const handleEditScreen = useCallback(
    (id: string) => {
      navigate(paths.dashboard.screens.edit(id));
    },
    [navigate]
  );

  const handleCreateScreen = useCallback(() => {
    navigate(paths.dashboard.screens.create);
  }, [navigate]);

  const handleOpenDeleteDialog = useCallback(
    (id: string) => {
      setSelectedScreenId(id);
      confirmDelete.onTrue();
      popover.onClose();
    },
    [confirmDelete, popover]
  );

  const handleDeleteScreen = useCallback(() => {
    if (selectedScreenId) {
      deleteScreen({ url: API_ENDPOINTS.screenManager.delete(selectedScreenId) });
    }
  }, [selectedScreenId, deleteScreen]);

  
  const renderScreensContent = useCallback(() => {
    if (loading) {
      return <ScreenCardSkeletonGrid count={6} />;
    }

    if (screens.length === 0) {
      return (
        <EmptyContent
          filled
          title="Screens Not Found"
          description={
            searchTerm || filterStatus !== 'all'
              ? "No screens found matching your filters. Try adjusting your search criteria."
              : "You don't have any screens yet. Create your first screen to get started."
          }
          action={
            searchTerm || filterStatus !== 'all' ? null : (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                onClick={handleCreateScreen}
                sx={{ mt: 2 }}
              >
                Add First Screen
              </Button>
            )
          }
          sx={{ py: 10 }}
        />
      );
    }

    return (
      <Grid container spacing={3}>
        {screens.map((screen) => (
          <Grid xs={12} sm={6} md={4} key={screen.id}>
            <ScreenCard
              screen={screen}
              onView={() => handleViewScreen(screen.id)}
              onEdit={() => handleEditScreen(screen.id)}
              onMenuClick={(event) => {
                setSelectedScreenId(screen.id);
                popover.onOpen(event);
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }, [
    loading,
    screens,
    searchTerm,
    filterStatus,
    handleCreateScreen,
    handleViewScreen,
    handleEditScreen,
    popover,
  ]);

  return (
    <>
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
              Screen Manager
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
              onClick={handleCreateScreen}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                },
              }}
            >
              Add Screen
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
                      {stats.totalScreens}
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
                      <Iconify
                        icon="solar:monitor-bold-duotone"
                        width={28}
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Total Screens
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
                      {stats.onlineScreens}
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
                      <Iconify
                        icon="solar:check-circle-bold-duotone"
                        width={28}
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Online Screens
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
                      {stats.maintenanceScreens}
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
                      <Iconify
                        icon="solar:settings-bold-duotone"
                        width={28}
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Maintenance
                  </Typography>
                </Stack>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 16px rgba(211, 47, 47, 0.2)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography 
                      variant="h3"
                      sx={{ 
                        fontWeight: 700,
                        color: '#d32f2f',
                      }}
                    >
                      {stats.inactiveScreens}
                    </Typography>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                      }}
                    >
                      <Iconify
                        icon="solar:close-circle-bold-duotone"
                        width={28}
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Offline Screens
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
            <Stack spacing={2}>
              <TextField
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search screens by title, position, category or size..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'white',
                    '&:hover': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-bold" sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip
                  label="All"
                  onClick={() => handleFilterChange('all')}
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
                  onClick={() => handleFilterChange('active')}
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
                  label="Inactive"
                  onClick={() => handleFilterChange('inactive')}
                  sx={{
                    background: filterStatus === 'inactive' 
                      ? 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'
                      : 'transparent',
                    color: filterStatus === 'inactive' ? 'white' : 'inherit',
                    fontWeight: filterStatus === 'inactive' ? 600 : 400,
                    border: filterStatus === 'inactive' ? 'none' : '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      background: filterStatus === 'inactive' 
                        ? 'linear-gradient(135deg, #c62828 0%, #d32f2f 100%)'
                        : 'action.hover',
                    },
                  }}
                />
                <Chip
                  label="Maintenance"
                  onClick={() => handleFilterChange('maintenance')}
                  sx={{
                    background: filterStatus === 'maintenance' 
                      ? 'linear-gradient(135deg, #ffab00 0%, #ffc107 100%)'
                      : 'transparent',
                    color: filterStatus === 'maintenance' ? 'white' : 'inherit',
                    fontWeight: filterStatus === 'maintenance' ? 600 : 400,
                    border: filterStatus === 'maintenance' ? 'none' : '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      background: filterStatus === 'maintenance' 
                        ? 'linear-gradient(135deg, #f57c00 0%, #ffab00 100%)'
                        : 'action.hover',
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Card>

          {}
          {renderScreensContent()}
        </Stack>
      </Container>

      {}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            if (selectedScreenId) {
              handleViewScreen(selectedScreenId.toString());
            }
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedScreenId) {
              handleEditScreen(selectedScreenId.toString());
            }
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedScreenId) {
              handleOpenDeleteDialog(selectedScreenId.toString());
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      {}
      <Dialog open={confirmDelete.value} onClose={confirmDelete.onFalse}>
        <DialogTitle>Delete Screen?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this screen? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDelete.onFalse} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteScreen} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
