

export interface IRegion {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface IDistrict {
  id: number;
  name: string;
  code: string;
  region: number; 
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface IRegionWithDistricts {
  region: IRegion;
  districts: IDistrict[];
  district_count: number;
}

export interface IRegionListParams {
  search?: string;
  code?: string;
  ordering?: string;
}

export interface IDistrictListParams {
  search?: string;
  region?: number;
  code?: string;
  ordering?: string;
}

export interface IRegionListResponse {
  results: IRegion[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface IDistrictListResponse {
  results: IDistrict[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface IRegionOption {
  value: number;
  label: string;
  code?: string;
}

export interface IDistrictOption {
  value: number;
  label: string;
  region: number;
  code?: string;
}
