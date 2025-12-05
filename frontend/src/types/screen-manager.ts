

import type { IRegion, IDistrict } from './region';

export type IScreenManagerStatus = 'active' | 'inactive' | 'maintenance';

export type IScreenManager = {
    id: number;
    title: string;
    position: string;
    location?: string | null;
    coordinates?: { lat: number; lng: number } | null;
    region?: IRegion | null;
    district?: IDistrict | null;
    status: IScreenManagerStatus;
    type_category: string;
    screen_size: string;
    screen_resolution: number;
    created_at: string;
    updated_at: string;
    created_by: number | null;
    updated_by: number | null;
};

export type IScreenManagerStats = {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
};

export type IScreenManagerAggregate = {
    status_groups: Array<{
        status: string;
        status_display: string;
        count: number;
    }>;
    total: number;
};

export type IScreenManagerListParams = {
    search?: string;
    status?: IScreenManagerStatus;
    type_category?: string;
    screen_size?: string;
    ordering?: string;
    limit?: number;
    offset?: number;
};

export type IScreenManagerListResponse = {
    results: IScreenManager[];
    count: number;
    next: string | null;
    previous: string | null;
};

export type IScreenManagerCreateUpdate = {
    title: string;
    position: string;
    location?: string | null;
    coordinates?: { lat: number; lng: number } | null;
    status: IScreenManagerStatus;
    type_category: string;
    screen_size: string;
    screen_resolution: number;
    region_id: number | null;
    district_id: number | null;
};
