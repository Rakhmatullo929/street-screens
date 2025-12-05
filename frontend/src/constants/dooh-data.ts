

export type WeeklySchedule = {
  [key: string]: boolean; 
};

export interface GeoTarget {
  region: string; 
  district: string; 
}

export type Campaign = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  venues: number;
  startDate: string;
  endDate: string;
  creative: string;
  currency?: string;
  geoTarget?: GeoTarget; 
  interests?: string[];
  venueTypes?: string[];
  ageRange?: [number, number]; 
  schedule?: WeeklySchedule; 
  
  displayDuration?: 5 | 10 | 15; 
  contentType?: 'video' | 'image'; 
  contentFiles?: File[] | string[]; 
};

export const CAMPAIGN_STATUS_OPTIONS = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
] as const;

export const DISPLAY_DURATION_OPTIONS = [
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 15, label: '15 seconds' },
] as const;

export const CONTENT_TYPE_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
] as const;

const generateBusinessSchedule = (): WeeklySchedule => {
  const schedule: WeeklySchedule = {};
  for (let day = 1; day <= 5; day += 1) {
    for (let hour = 9; hour <= 17; hour += 1) {
      schedule[`${day}-${hour}`] = true;
    }
  }
  return schedule;
};

const generateEveningSchedule = (): WeeklySchedule => {
  const schedule: WeeklySchedule = {};
  for (let day = 0; day <= 6; day += 1) {
    for (let hour = 18; hour <= 22; hour += 1) {
      schedule[`${day}-${hour}`] = true;
    }
  }
  return schedule;
};

const generateWeekendSchedule = (): WeeklySchedule => {
  const schedule: WeeklySchedule = {};
  for (let day = 0; day <= 6; day += 1) {
    if (day === 0 || day === 6) { 
      for (let hour = 10; hour <= 21; hour += 1) {
        schedule[`${day}-${hour}`] = true;
      }
    }
  }
  return schedule;
};

const generateAlwaysOnSchedule = (): WeeklySchedule => {
  const schedule: WeeklySchedule = {};
  for (let day = 0; day <= 6; day += 1) {
    for (let hour = 0; hour <= 23; hour += 1) {
      schedule[`${day}-${hour}`] = true;
    }
  }
  return schedule;
};

const convertBackendScheduleToCalendar = (backendSchedule: Record<string, number[]> | undefined): WeeklySchedule => {
  const calendarSchedule: WeeklySchedule = {};
  
  if (!backendSchedule || typeof backendSchedule !== 'object') {
    return calendarSchedule;
  }

  
  [0, 1, 2, 3, 4, 5, 6].forEach(day => {
    const dayKey = day.toString();
    const hours = backendSchedule[dayKey];
    
    if (Array.isArray(hours)) {
      
      hours.forEach(hour => {
        if (hour >= 0 && hour <= 23) {
          calendarSchedule[`${day}-${hour}`] = true;
        }
      });
    }
  });

  return calendarSchedule;
};

export { generateBusinessSchedule, generateEveningSchedule, generateWeekendSchedule, generateAlwaysOnSchedule, convertBackendScheduleToCalendar };

export const CAMPAIGNS = [
  {
    id: 'camp-001',
    name: 'Uztelecom Summer Campaign',
    status: 'active' as const,
    budget: 15000,
    spent: 8500,
    impressions: 1250000,
    clicks: 12500,
    ctr: 1.0,
    venues: 45,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    creative: 'summer-promo.mp4',
    ageRange: [18, 45] as [number, number],
    schedule: generateBusinessSchedule(),
    geoTarget: { region: 'tashkent-city', district: 'chilanzar' },
    interests: ['Technology', 'Travel', 'Business'],
    venueTypes: ['shopping', 'transport', 'office'],
    displayDuration: 15 as const,
    contentType: 'video' as const,
    contentFiles: ['summer-promo.mp4'],
  },
  {
    id: 'camp-002',
    name: 'UzAuto Motors Launch',
    status: 'active' as const,
    budget: 25000,
    spent: 18750,
    impressions: 2100000,
    clicks: 21000,
    ctr: 1.2,
    venues: 78,
    startDate: '2024-01-10',
    endDate: '2024-03-10',
    creative: 'car-launch.jpg',
    ageRange: [25, 55] as [number, number],
    schedule: generateEveningSchedule(),
    geoTarget: { region: 'fergana', district: 'fergana-city' },
    interests: ['Automotive', 'Technology', 'Business'],
    venueTypes: ['street', 'shopping', 'sports'],
    displayDuration: 10 as const,
    contentType: 'image' as const,
    contentFiles: ['car-launch.jpg'],
  },
  {
    id: 'camp-003',
    name: 'Humo Bank Digital',
    status: 'paused' as const,
    budget: 12000,
    spent: 4800,
    impressions: 680000,
    clicks: 5440,
    ctr: 0.8,
    venues: 32,
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    creative: 'bank-promo.html5',
    ageRange: [21, 60] as [number, number],
    schedule: generateWeekendSchedule(),
    geoTarget: { region: 'bukhara', district: 'kagan' },
    interests: ['Finance', 'Business', 'Real Estate'],
    venueTypes: ['office', 'shopping'],
    displayDuration: 5 as const,
    contentType: 'video' as const,
    contentFiles: ['bank-promo.html5'],
  },
  {
    id: 'camp-004',
    name: 'Ucell Network Expansion',
    status: 'completed' as const,
    budget: 18000,
    spent: 18000,
    impressions: 1890000,
    clicks: 18900,
    ctr: 1.1,
    venues: 65,
    startDate: '2023-12-01',
    endDate: '2024-01-01',
    creative: 'network-expansion.mp4',
    ageRange: [13, 65] as [number, number],
    schedule: generateAlwaysOnSchedule(),
    geoTarget: { region: 'samarkand', district: 'samarkand-city' },
    interests: ['Технологии', 'Развлечения', 'Музыка', 'Спорт'],
    venueTypes: ['shopping', 'transport', 'entertainment', 'street'],
    displayDuration: 15 as const,
    contentType: 'video' as const,
    contentFiles: ['network-expansion.mp4'],
  },
] as const;

export const SCREENS = [
  {
    id: 'screen-001',
    name: 'Ташкент Центр - Лобби',
    location: 'Площадь Независимости, Ташкент',
    venue: 'Business Center' as const,
    status: 'online' as const,
    resolution: '1920x1080',
    size: '55 inch',
    type: 'LED Screen' as const,
    uptime: 99.8,
    lastSeen: '2024-01-15T10:30:00Z',
    revenue: 1250,
    impressions: 45000,
    coordinates: { lat: 41.2995, lng: 69.2401 },
    campaign: 'Uztelecom Campaign',
  },
  {
    id: 'screen-002',
    name: 'Самарканд Mall - Вход',
    location: 'ТЦ Самарканд Плаза',
    venue: 'Shopping Mall' as const,
    status: 'online' as const,
    resolution: '3840x2160',
    size: '65 inch',
    type: 'Digital Billboard' as const,
    uptime: 98.5,
    lastSeen: '2024-01-15T10:25:00Z',
    revenue: 2100,
    impressions: 78000,
    coordinates: { lat: 39.6547, lng: 66.9597 },
    campaign: 'Uzbekistan Airways',
  },
  {
    id: 'screen-003',
    name: 'Аэропорт Ташкент - Зал A',
    location: 'Международный аэропорт Ташкент',
    venue: 'Airport' as const,
    status: 'maintenance' as const,
    resolution: '1920x1080',
    size: '43 inch',
    type: 'Digital Billboard' as const,
    uptime: 95.2,
    lastSeen: '2024-01-14T18:45:00Z',
    revenue: 890,
    impressions: 32000,
    coordinates: { lat: 41.2579, lng: 69.2812 },
    campaign: 'UzAuto Motors',
  },
  {
    id: 'screen-004',
    name: 'Бухара Отель - Ресепшн',
    location: 'Гостиница "Бухара"',
    venue: 'Hotel' as const,
    status: 'offline' as const,
    resolution: '1920x1080',
    size: '50 inch',
    type: 'LED Screen' as const,
    uptime: 87.3,
    lastSeen: '2024-01-13T14:20:00Z',
    revenue: 650,
    impressions: 25000,
    coordinates: { lat: 39.7681, lng: 64.4556 },
    campaign: 'Maintenance',
  },
  {
    id: 'screen-005',
    name: 'Андижан Фитнес - Зал',
    location: 'Спортзал "Энергия"',
    venue: 'Fitness Center' as const,
    status: 'online' as const,
    resolution: '1920x1080',
    size: '40 inch',
    type: 'LED Screen' as const,
    uptime: 96.7,
    lastSeen: '2024-01-15T10:15:00Z',
    revenue: 780,
    impressions: 28000,
    coordinates: { lat: 40.7831, lng: 72.3441 },
    campaign: 'Ucell Network',
  },
  {
    id: 'screen-006',
    name: 'Наманган Коворкинг',
    location: 'IT Park Наманган',
    venue: 'Coworking Space' as const,
    status: 'online' as const,
    resolution: '2560x1440',
    size: '32 inch',
    type: 'Digital Billboard' as const,
    uptime: 99.1,
    lastSeen: '2024-01-15T10:35:00Z',
    revenue: 920,
    impressions: 35000,
    coordinates: { lat: 40.9983, lng: 71.6726 },
    campaign: 'Humo Bank',
  },
  {
    id: 'screen-007',
    name: 'Фергана Центр - Площадь',
    location: 'Центральная площадь, Фергана',
    venue: 'Street' as const,
    status: 'online' as const,
    resolution: '3840x2160',
    size: '85 inch',
    type: 'LED Screen' as const,
    uptime: 97.8,
    lastSeen: '2024-01-15T10:20:00Z',
    revenue: 1850,
    impressions: 68000,
    coordinates: { lat: 40.3864, lng: 71.7864 },
    campaign: 'Ucell Network',
  },
  {
    id: 'screen-008',
    name: 'Хива Туристический - Ворота',
    location: 'Ичан-Кала, Хива',
    venue: 'Tourist Area' as const,
    status: 'online' as const,
    resolution: '1920x1080',
    size: '50 inch',
    type: 'Digital Billboard' as const,
    uptime: 98.9,
    lastSeen: '2024-01-15T10:18:00Z',
    revenue: 1450,
    impressions: 52000,
    coordinates: { lat: 41.3775, lng: 60.3631 },
    campaign: 'Uzbekistan Airways',
  },
  {
    id: 'screen-009',
    name: 'Каршы ТЦ - Главный вход',
    location: 'ТЦ "Каршы Сити"',
    venue: 'Shopping Mall' as const,
    status: 'online' as const,
    resolution: '2560x1440',
    size: '60 inch',
    type: 'LED Screen' as const,
    uptime: 96.2,
    lastSeen: '2024-01-15T10:12:00Z',
    revenue: 1100,
    impressions: 42000,
    coordinates: { lat: 38.8606, lng: 65.7975 },
    campaign: 'Uztelecom Campaign',
  },
  {
    id: 'screen-010',
    name: 'Термез Аэропорт - Терминал',
    location: 'Международный аэропорт Термез',
    venue: 'Airport' as const,
    status: 'online' as const,
    resolution: '1920x1080',
    size: '55 inch',
    type: 'Digital Billboard' as const,
    uptime: 99.2,
    lastSeen: '2024-01-15T10:28:00Z',
    revenue: 1320,
    impressions: 48000,
    coordinates: { lat: 37.2864, lng: 67.3095 },
    campaign: 'UzAuto Motors',
  },
  {
    id: 'screen-011',
    name: 'Нукус Культурный - Музей',
    location: 'Музей искусств, Нукус',
    venue: 'Museum' as const,
    status: 'online' as const,
    resolution: '3840x2160',
    size: '70 inch',
    type: 'LED Screen' as const,
    uptime: 97.5,
    lastSeen: '2024-01-15T10:22:00Z',
    revenue: 890,
    impressions: 32000,
    coordinates: { lat: 42.4531, lng: 59.6103 },
    campaign: 'Humo Bank',
  },
  {
    id: 'screen-012',
    name: 'Джизак Спорт - Стадион',
    location: 'Центральный стадион, Джизак',
    venue: 'Sports Arena' as const,
    status: 'online' as const,
    resolution: '3840x2160',
    size: '100 inch',
    type: 'LED Screen' as const,
    uptime: 98.1,
    lastSeen: '2024-01-15T10:26:00Z',
    revenue: 2450,
    impressions: 92000,
    coordinates: { lat: 40.1158, lng: 67.8422 },
    campaign: 'Ucell Network',
  },
  {
    id: 'screen-013',
    name: 'Гулистан Парк - Центр',
    location: 'Центральный парк, Гулистан',
    venue: 'Park' as const,
    status: 'maintenance' as const,
    resolution: '1920x1080',
    size: '65 inch',
    type: 'Digital Billboard' as const,
    uptime: 94.8,
    lastSeen: '2024-01-14T16:45:00Z',
    revenue: 720,
    impressions: 28000,
    coordinates: { lat: 40.4897, lng: 68.7842 },
    campaign: 'Maintenance',
  },
  {
    id: 'screen-014',
    name: 'Коканд Отель - Лобби',
    location: 'Гостиница "Коканд"',
    venue: 'Hotel' as const,
    status: 'online' as const,
    resolution: '2560x1440',
    size: '55 inch',
    type: 'LED Screen' as const,
    uptime: 97.3,
    lastSeen: '2024-01-15T10:24:00Z',
    revenue: 1180,
    impressions: 44000,
    coordinates: { lat: 40.5289, lng: 70.9428 },
    campaign: 'Uzbekistan Airways',
  },
  {
    id: 'screen-015',
    name: 'Ангрен ТЦ - Фудкорт',
    location: 'ТРЦ "Ангрен Молл"',
    venue: 'Shopping Mall' as const,
    status: 'online' as const,
    resolution: '1920x1080',
    size: '48 inch',
    type: 'Digital Billboard' as const,
    uptime: 96.9,
    lastSeen: '2024-01-15T10:16:00Z',
    revenue: 980,
    impressions: 38000,
    coordinates: { lat: 41.0167, lng: 70.1436 },
    campaign: 'Uztelecom Campaign',
  },
] as const;

export const CAMPAIGNS_BY_STATUS = CAMPAIGNS.reduce((acc, campaign) => {
  if (!acc[campaign.status]) acc[campaign.status] = [];
  (acc[campaign.status] as any[]).push(campaign);
  return acc;
}, {} as Record<string, any[]>);

export const SCREENS_BY_STATUS = SCREENS.reduce((acc, screen) => {
  if (!acc[screen.status]) acc[screen.status] = [];
  (acc[screen.status] as any[]).push(screen);
  return acc;
}, {} as Record<string, any[]>);

export const CAMPAIGNS_STATS = {
  total: CAMPAIGNS.length,
  active: CAMPAIGNS.filter(c => c.status === 'active').length,
  totalScreens: CAMPAIGNS.reduce((sum, c) => sum + c.venues, 0),
  totalImpressions: CAMPAIGNS.reduce((sum, c) => sum + c.impressions, 0),
  totalSpend: CAMPAIGNS.reduce((sum, c) => sum + c.spent, 0),
};

export const SCREENS_STATS = {
  total: SCREENS.length,
  online: SCREENS.filter(s => s.status === 'online').length,
  totalScreens: SCREENS.length,
  onlineScreens: SCREENS.filter(s => s.status === 'online').length,
  totalRevenue: SCREENS.reduce((sum, s) => sum + s.revenue, 0),
  totalImpressions: SCREENS.reduce((sum, s) => sum + s.impressions, 0),
};

type ChipColor = 'success' | 'warning' | 'info' | 'error' | 'default' | 'primary' | 'secondary';

const STATUS_COLOR_MAP: Record<string, ChipColor> = {
  active: 'success',
  online: 'success',
  paused: 'warning',
  maintenance: 'warning',
  completed: 'info',
  offline: 'error',
  draft: 'default',
};

const VENUE_ICON_MAP = {
  'Business Center': 'solar:buildings-2-bold-duotone',
  'Shopping Mall': 'solar:shop-2-bold-duotone',
  'Airport': 'solar:airplane-bold-duotone',
  'Hotel': 'solar:bed-bold-duotone',
  'Fitness Center': 'solar:dumbbell-bold-duotone',
  'Coworking Space': 'solar:laptop-bold-duotone',
  'Street': 'solar:streets-map-point-bold-duotone',
  'Tourist Area': 'solar:suitcase-bold-duotone',
  'Museum': 'solar:medallion-bold-duotone',
  'Sports Arena': 'solar:basketball-bold-duotone',
  'Park': 'solar:tree-bold-duotone',
} as const;

export const getStatusColor = (status: string): ChipColor => 
  STATUS_COLOR_MAP[status] || 'default';

export const getVenueIcon = (venue: string): string => 
  VENUE_ICON_MAP[venue as keyof typeof VENUE_ICON_MAP] || 'solar:monitor-bold-duotone';
