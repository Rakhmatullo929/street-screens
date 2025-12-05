

export type MediaFile = {
  id: string;
  name: string;
  type: 'video' | 'image' | 'design';
  format: string; 
  size: number; 
  duration?: number; 
  dimensions: {
    width: number;
    height: number;
  };
  thumbnail: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  usedInCampaigns: string[]; 
  tags: string[];
};

export const MEDIA_FILES: MediaFile[] = [
  {
    id: 'media-001',
    name: 'Uztelecom Summer Promo',
    type: 'video',
    format: 'mp4',
    size: 45600000, 
    duration: 30,
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_1.webp',
    url: '/media/videos/uztelecom-summer.mp4',
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'Admin User',
    usedInCampaigns: ['camp-001'],
    tags: ['telecom', 'summer', 'promo', '2024'],
  },
  {
    id: 'media-002',
    name: 'UzAuto Motors Launch',
    type: 'video',
    format: 'mp4',
    size: 62400000, 
    duration: 45,
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_2.webp',
    url: '/media/videos/uzauto-launch.mp4',
    uploadedAt: '2024-01-10T14:20:00Z',
    uploadedBy: 'Marketing Team',
    usedInCampaigns: ['camp-002'],
    tags: ['automotive', 'launch', 'cars'],
  },
  {
    id: 'media-003',
    name: 'Humo Bank Digital Banner',
    type: 'image',
    format: 'jpg',
    size: 2400000, 
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_3.webp',
    url: '/media/images/humo-banner.jpg',
    uploadedAt: '2024-01-20T09:15:00Z',
    uploadedBy: 'Design Team',
    usedInCampaigns: ['camp-003'],
    tags: ['banking', 'digital', 'banner'],
  },
  {
    id: 'media-004',
    name: 'Ucell Network Campaign',
    type: 'video',
    format: 'mp4',
    size: 51200000, 
    duration: 35,
    dimensions: {
      width: 3840,
      height: 2160,
    },
    thumbnail: '/assets/images/home/hero_4.webp',
    url: '/media/videos/ucell-network.mp4',
    uploadedAt: '2023-12-01T11:45:00Z',
    uploadedBy: 'Content Team',
    usedInCampaigns: ['camp-004'],
    tags: ['telecom', 'network', '4k'],
  },
  {
    id: 'media-005',
    name: 'Holiday Sale Graphic',
    type: 'image',
    format: 'png',
    size: 3800000, 
    dimensions: {
      width: 2560,
      height: 1440,
    },
    thumbnail: '/assets/images/home/hero_5.webp',
    url: '/media/images/holiday-sale.png',
    uploadedAt: '2024-01-22T16:30:00Z',
    uploadedBy: 'Design Team',
    usedInCampaigns: [],
    tags: ['holiday', 'sale', 'retail'],
  },
  {
    id: 'media-006',
    name: 'Brand Story Video',
    type: 'video',
    format: 'mp4',
    size: 78900000, 
    duration: 60,
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_6.webp',
    url: '/media/videos/brand-story.mp4',
    uploadedAt: '2024-01-18T13:20:00Z',
    uploadedBy: 'Marketing Team',
    usedInCampaigns: [],
    tags: ['brand', 'story', 'corporate'],
  },
  {
    id: 'media-007',
    name: 'Product Showcase',
    type: 'image',
    format: 'jpg',
    size: 1900000, 
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_7.webp',
    url: '/media/images/product-showcase.jpg',
    uploadedAt: '2024-01-25T10:00:00Z',
    uploadedBy: 'Product Team',
    usedInCampaigns: [],
    tags: ['product', 'showcase', 'commercial'],
  },
  {
    id: 'media-008',
    name: 'Tech Innovation Video',
    type: 'video',
    format: 'mp4',
    size: 55300000, 
    duration: 40,
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_8.webp',
    url: '/media/videos/tech-innovation.mp4',
    uploadedAt: '2024-01-12T15:45:00Z',
    uploadedBy: 'Tech Team',
    usedInCampaigns: [],
    tags: ['technology', 'innovation', 'modern'],
  },
  {
    id: 'media-009',
    name: 'Summer Festival Poster',
    type: 'design',
    format: 'psd',
    size: 125000000, 
    dimensions: {
      width: 3000,
      height: 4000,
    },
    thumbnail: '/assets/images/home/hero_9.webp',
    url: '/media/designs/summer-festival.psd',
    uploadedAt: '2024-01-08T09:30:00Z',
    uploadedBy: 'Design Team',
    usedInCampaigns: [],
    tags: ['festival', 'summer', 'poster', 'psd'],
  },
  {
    id: 'media-010',
    name: 'Corporate Presentation',
    type: 'video',
    format: 'mp4',
    size: 42100000, 
    duration: 25,
    dimensions: {
      width: 1920,
      height: 1080,
    },
    thumbnail: '/assets/images/home/hero_10.webp',
    url: '/media/videos/corporate-presentation.mp4',
    uploadedAt: '2024-01-28T12:00:00Z',
    uploadedBy: 'Corporate Team',
    usedInCampaigns: [],
    tags: ['corporate', 'presentation', 'business'],
  },
];

export const MEDIA_TYPE_OPTIONS = [
  { value: 'all', label: 'All Media' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Images' },
  { value: 'design', label: 'Designs' },
];

export const FORMAT_ICONS = {
  mp4: 'solar:videocamera-record-bold-duotone',
  mov: 'solar:videocamera-record-bold-duotone',
  avi: 'solar:videocamera-record-bold-duotone',
  jpg: 'solar:gallery-bold-duotone',
  jpeg: 'solar:gallery-bold-duotone',
  png: 'solar:gallery-bold-duotone',
  gif: 'solar:gallery-bold-duotone',
  webp: 'solar:gallery-bold-duotone',
  psd: 'solar:layers-bold-duotone',
  ai: 'solar:layers-bold-duotone',
  svg: 'solar:layers-bold-duotone',
  figma: 'solar:layers-bold-duotone',
};

export const MEDIA_STATS = {
  totalFiles: MEDIA_FILES.length,
  totalVideos: MEDIA_FILES.filter((f) => f.type === 'video').length,
  totalImages: MEDIA_FILES.filter((f) => f.type === 'image').length,
  totalDesigns: MEDIA_FILES.filter((f) => f.type === 'design').length,
  totalSize: MEDIA_FILES.reduce((sum, f) => sum + f.size, 0),
  usedInCampaigns: MEDIA_FILES.filter((f) => f.usedInCampaigns.length > 0).length,
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'error';
    case 'image':
      return 'success';
    case 'design':
      return 'info';
    default:
      return 'default';
  }
};

