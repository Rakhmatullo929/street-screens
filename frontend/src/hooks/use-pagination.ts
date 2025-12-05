import { useState, useCallback, useMemo } from 'react';
import { AxiosRequestConfig } from 'axios';

import { useApiQuery } from './use-api-query';

interface UsePaginationOptions extends AxiosRequestConfig {
  initialPage?: number;
  initialPageSize?: number;
  isPublic?: boolean;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface PaginationData<T = any> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface UsePaginationReturn<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: any;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => Promise<void>;
}

export function usePagination<T = any>(options: UsePaginationOptions): UsePaginationReturn<T> {
  const { initialPage = 1, initialPageSize = 10, enabled = true, ...restOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const queryOptions = useMemo(
    () => ({
      ...restOptions,
      params: {
        ...restOptions.params,
        page,
        page_size: pageSize,
      },
      enabled,
    }),
    [page, pageSize, enabled, restOptions]
  );

  const { data: response, loading, error, refetch } = useApiQuery<PaginationData<T>>(queryOptions);

  const data = useMemo(() => response?.results || [], [response]);
  const total = useMemo(() => response?.count || 0, [response]);
  const hasNextPage = useMemo(() => !!response?.next, [response]);
  const hasPreviousPage = useMemo(() => !!response?.previous, [response]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage && page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [hasPreviousPage, page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); 
  }, []);

  return {
    data,
    total,
    page,
    pageSize,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    setPageSize: handleSetPageSize,
    refetch,
  };
}

