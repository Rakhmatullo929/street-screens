import axios from 'axios';

import { HOST_API } from 'src/config-global';

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export const USER_TYPES = {
  ADS_CLIENT: 'ads_client',
  ADS_MANAGER: 'ads_manager',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const API_ENDPOINTS = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: 'users/user/',
    login: 'users/login/',
    register: 'users/register/',
    logout: 'users/logout/',
    updateUser: 'users/user/',
    tokenVerify: 'users/token/verify/',
    tokenRefresh: 'users/token/refresh/',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  screenManager: {
    
    list: 'main/screen-managers/',
    detail: (id: string | number) => `main/screen-managers/${id}/`,
    create: 'main/screen-managers/',
    update: (id: string | number) => `main/screen-managers/${id}/`,
    delete: (id: string | number) => `main/screen-managers/${id}/`,
    
    stats: 'main/screen-managers/stats/',
    aggregateByStatus: 'main/screen-managers/aggregate_by_status/',
    active: (id: string | number) => `main/screen-managers/${id}/active/`,
    inactive: (id: string | number) => `main/screen-managers/${id}/inactive/`,
    maintenance: (id: string | number) => `main/screen-managers/${id}/maintenance/`,
    activate: (id: string | number) => `main/screen-managers/${id}/activate/`,
    deactivate: (id: string | number) => `main/screen-managers/${id}/deactivate/`,
    setMaintenance: (id: string | number) => `main/screen-managers/${id}/set_maintenance/`,
  },
  region: {
    
    list: 'main/regions/',
    detail: (id: string | number) => `main/regions/${id}/`,
    
    districts: (id: string | number) => `main/regions/${id}/districts/`,
  },
  district: {
    
    list: 'main/districts/',
    detail: (id: string | number) => `main/districts/${id}/`,
    
    byRegion: 'main/districts/by_region/',
  },
  adsManager: {
    
    list: 'main/ads-managers/',
    detail: (id: string | number) => `main/ads-managers/${id}/`,
    create: 'main/ads-managers/',
    update: (id: string | number) => `main/ads-managers/${id}/`,
    delete: (id: string | number) => `main/ads-managers/${id}/`,
    
    stats: 'main/ads-managers/stats/',
    aggregateByStatus: 'main/ads-managers/aggregate_by_status/',
    active: 'main/ads-managers/active/',
    draft: 'main/ads-managers/draft/',
    paused: 'main/ads-managers/paused/',
    completed: 'main/ads-managers/completed/',
    activate: (id: string | number) => `main/ads-managers/${id}/activate/`,
    pause: (id: string | number) => `main/ads-managers/${id}/pause/`,
    complete: (id: string | number) => `main/ads-managers/${id}/complete/`,
    regions: 'main/ads-managers/regions/',
    districts: 'main/ads-managers/districts/',
    interests: 'main/ads-managers/interests/',
    venueTypes: 'main/ads-managers/venue_types/',
    filterByInterest: 'main/ads-managers/filter_by_interest/',
    filterByVenueType: 'main/ads-managers/filter_by_venue_type/',
    summary: 'main/ads-managers/summary/',
  },
  interest: {
    list: 'main/interests/',
    detail: (id: string | number) => `main/interests/${id}/`,
  },
  venueType: {
    list: 'main/venue-types/',
    detail: (id: string | number) => `main/venue-types/${id}/`,
  },
  screenVideos: {
    list: (screenId: string | number) => `main/screen-videos/${screenId}/`,
  },
};
