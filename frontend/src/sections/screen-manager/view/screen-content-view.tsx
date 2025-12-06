import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';

import {
  Container,
  Stack,
  Typography,
  Button,
  Card,
  Box,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useSettingsContext } from 'src/components/settings';
import { useApiQuery } from 'src/hooks/use-api-query';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { MediaCardSkeletonGrid } from 'src/components/skeleton';

import { API_ENDPOINTS } from 'src/utils/axios';

interface ScreenVideo {
  id: number;
  ads_manager: number;
  ads_manager_name: string;
  ads_manager_status: string;
  video: string;
  video_url: string;
  title: string | null;
  description: string | null;
  duration: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}

interface PaginatedScreenVideos {
  count: number;
  next: string | null;
  previous: string | null;
  results: ScreenVideo[];
}

function VideoCard({ 
  video, 
  isPlaying, 
  onPlay, 
  onPause 
}: { 
  video: ScreenVideo;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.customShadows.dropdown,
        },
      }}
    >
      {}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16/9',
          bgcolor: 'grey.100',
          overflow: 'hidden',
        }}
      >
        {isPlaying ? (
          
          <Box
            component="video"
            controls
            autoPlay
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onEnded={onPause}
            onPause={onPause}
          >
            <source src={video.video} type="video/mp4" />
            Your browser does not support the video tag.
          </Box>
        ) : (
          
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.2)',
                zIndex: 1,
              },
            }}
            onClick={onPlay}
          >
            {}
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Iconify icon="solar:play-circle-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
            </Box>

            {}
            {video.duration && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  typography: 'caption',
                  zIndex: 3,
                }}
              >
                {video.duration}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" noWrap title={video.title || `Video #${video.id}`}>
              {video.title || `Video #${video.id}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Campaign: {video.ads_manager_name}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            {video.duration && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Duration:
                </Typography>
                <Typography variant="caption">
                  {video.duration}
                </Typography>
              </Stack>
            )}
            {video.file_size && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Size:
                </Typography>
                <Typography variant="caption">
                  {(video.file_size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Added:
              </Typography>
              <Typography variant="caption">
                {new Date(video.created_at).toLocaleDateString()}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

export default function ScreenContentView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const { id } = useParams<{ id: string }>();

  
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);

  
  const { data: response, loading, error, refetch } = useApiQuery<PaginatedScreenVideos>({
    url: id ? API_ENDPOINTS.screenVideos.list(id) : '',
    enabled: !!id,
  });

  // Extract videos from paginated response
  const videos = response?.results || [];

  // Video playback handlers
  const handlePlayVideo = (videoId: number) => {
    setPlayingVideoId(videoId);
  };

  const handlePauseVideo = () => {
    setPlayingVideoId(null);
  };

  if (!id) {
    return <Navigate to="/dashboard/map" replace />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:monitor-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
              <Typography variant="h4">Screen #{id} - Videos</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              All videos available on this screen
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:refresh-bold" />}
              onClick={() => refetch()}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
              href="/dashboard/map"
            >
              Back to Map
            </Button>
          </Stack>
        </Stack>

        {}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:monitor-bold-duotone" width={32} />
            </Avatar>
            <Stack flex={1}>
              <Typography variant="h6">Screen #{id}</Typography>
              <Typography variant="body2" color="text.secondary">
                Current status: <Chip
                  label="Online"
                  color="success"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolution: 1920x1080 • Type: LED Display
              </Typography>
            </Stack>
            <Stack alignItems="flex-end" spacing={1}>
              <Typography variant="h6" color="primary.main">
                {response?.count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Videos
              </Typography>
            </Stack>
          </Stack>
        </Card>

        {}
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:video-library-bold-duotone" width={24} />
            Videos
            {response && response.count > 0 && (
              <Chip 
                label={`${response.count} items`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Typography>

          {}
          {loading && <MediaCardSkeletonGrid count={6} />}

          {}
          {!loading && error && (
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ color: 'error.main' }}>
                <Iconify icon="solar:danger-circle-bold" width={24} />
                <Typography variant="body1">
                  Error loading videos: {error.message || 'Something went wrong'}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </Stack>
            </Card>
          )}

          {}
          {!loading && !error && videos && videos.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {videos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  isPlaying={playingVideoId === video.id}
                  onPlay={() => handlePlayVideo(video.id)}
                  onPause={handlePauseVideo}
                />
              ))}
            </Box>
          )}

          {}
          {!loading && !error && (!response || !videos || videos.length === 0) && (
            <EmptyContent
              filled
              title="No videos found"
              description="No videos are currently available for this screen"
              sx={{
                py: 10,
              }}
            />
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
