

export type IAdsManagerStatus = 'active' | 'paused' | 'completed' | 'draft';

export interface IInterest {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface IVenueType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IAdsManager {
  id: number;
  campaign_name: string;
  link?: string;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  region?: {
    id: number;
    name: string;
    code?: string;
    description?: string;
  } | null;
  district?: {
    id: number;
    name: string;
    code?: string;
    description?: string;
  } | null;
  interests: IInterest[];
  venue_types: IVenueType[];
  schedule: Record<string, number[]>;
  meta_schedule_slots: number;
  meta_schedule_coverage?: string;
  meta_duration_days: number;
  status: IAdsManagerStatus;
  status_display: string;
  schedule_coverage_percentage: number;
  is_active: boolean;
  videos?: Array<{
    id: number;
    video: string | null;
    title?: string;
    description?: string;
    file_size?: number;
    created_at: string;
  }>;
  images?: Array<{
    id: number;
    image: string | null;
    title?: string;
    description?: string;
    file_size?: number;
    width?: number;
    height?: number;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface IAdsManagerStats {
  total: number;
  active: number;
  draft: number;
  paused: number;
  completed: number;
  total_budget: number;
}

export interface IAdsManagerAggregate {
  status_groups: Array<{
    status: string;
    status_display: string;
    count: number;
    total_budget: number;
  }>;
  total: number;
  total_budget: number;
}

export interface IAdsManagerListParams {
  search?: string;
  status?: IAdsManagerStatus;
  currency?: string;
  region?: number;
  district?: number;
  venue_types?: number[];
  ordering?: string;
  limit?: number;
  offset?: number;
}

export interface IAdsManagerListResponse {
  results: IAdsManager[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface IAdsManagerCreateUpdate {
  campaign_name: string;
  link?: string;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  region_id?: number;
  district_id?: number;
  interest_ids?: number[];
  venue_type_ids?: number[];
  schedule?: Record<string, number[]>;
  content_files?: File[];
  content_type?: 'video' | 'image';
  display_duration?: 5 | 10 | 15;
}

export interface IAdsManagerRegionsResponse {
  regions: Array<{
    region: string;
    count: number;
  }>;
  total_regions: number;
}

export interface IAdsManagerDistrictsResponse {
  districts: Array<{
    id: number;
    name: string;
    code?: string;
    count: number;
  }>;
  total_districts: number;
}

export interface IAdsManagerInterestsResponse {
  interests: Array<{
    id: number;
    name: string;
    slug: string;
    count: number;
  }>;
  total_interests: number;
}

export interface IAdsManagerVenueTypesResponse {
  venue_types: Array<{
    id: number;
    name: string;
    slug: string;
    count: number;
  }>;
  total_venue_types: number;
}

export interface ITransformedAdsManager {
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
  schedule?: Record<string, boolean>;
  geoTarget?: {
    region: string;
    district: string;
  };
  displayDuration?: 5 | 10 | 15;
  contentType?: 'video' | 'image';
  contentFiles?: readonly string[];
}
