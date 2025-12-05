import {useMemo} from 'react';

import {
    IRegion,
    IDistrict,
    IRegionWithDistricts,
    IRegionOption,
    IDistrictOption,
    IRegionListParams,
    IDistrictListParams
} from 'src/types/region';

import {API_ENDPOINTS} from 'src/utils/axios';

import {useApiQuery} from './use-api-query';

export function useRegions(params?: IRegionListParams) {
    const {data, loading, error, refetch} = useApiQuery<{
        results: IRegion[];
        count: number;
        next: string | null;
        previous: string | null;
    }>({
        url: API_ENDPOINTS.region.list,
        params,
    });

    
    const regionOptions = useMemo((): IRegionOption[] => {
        if (!data?.results) return [];

        return data.results.map((region) => ({
            value: region.id,
            label: region.name,
            code: region.code,
        }));
    }, [data?.results]);

    return {
        regions: data?.results || [],
        regionOptions,
        loading,
        error,
        refetch,
        totalCount: data?.count || 0,
    };
}

export function useDistricts(params?: IDistrictListParams) {
    const {data, loading, error, refetch} = useApiQuery<{
        results: IDistrict[];
        count: number;
        next: string | null;
        previous: string | null;
    }>({
        url: API_ENDPOINTS.district.list,
        params,
    });

    
    const districtOptions = useMemo((): IDistrictOption[] => {
        if (!data?.results) return [];

        return data.results.map((district) => ({
            value: district.id,
            label: district.name,
            region: district.region,
            code: district.code,
        }));
    }, [data?.results]);

    return {
        districts: data?.results || [],
        districtOptions,
        loading,
        error,
        refetch,
        totalCount: data?.count || 0,
    };
}

export function useDistrictsByRegion(regionId: number | null) {
    const {data, loading, error, refetch} = useApiQuery<IDistrict[]>({
        url: regionId ? API_ENDPOINTS.region.districts(regionId) : undefined,
        enabled: !!regionId && regionId > 0,
    });

    
    const districtOptions = useMemo((): IDistrictOption[] => {
        if (!data) return [];

        return data.map((district) => ({
            value: district.id,
            label: district.name,
            region: district.region,
            code: district.code,
        }));
    }, [data]);

    return {
        districts: data || [],
        districtOptions,
        loading,
        error,
        refetch,
    };
}

export function useRegionsWithDistricts() {
    const {data, loading, error, refetch} = useApiQuery<IRegionWithDistricts[]>({
        url: API_ENDPOINTS.district.byRegion,
    });

    return {
        regionsWithDistricts: data || [],
        loading,
        error,
        refetch,
    };
}

export function useRegionDistrictOptions(selectedRegionId?: number | null) {
    const {regionOptions: regions, loading: regionsLoading} = useRegions();
    const {
        districtOptions,
        loading: districtsLoading
    } = useDistrictsByRegion(selectedRegionId ?? null);

    return {
        regions,
        districts: districtOptions,
        loading: regionsLoading || districtsLoading,
    };
}
