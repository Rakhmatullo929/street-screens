import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AxiosRequestConfig } from 'axios';

import { request } from 'src/utils/base-axios';

interface UseDebouncedApiOptions extends AxiosRequestConfig {
  isPublic?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseDebouncedApiReturn<T = any> {
  data: T | null;
  error: any;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
}

export function useDebouncedApi<T = any>(options: UseDebouncedApiOptions): UseDebouncedApiReturn<T> {
  const { debounceMs = 500, enabled = true, onSuccess, onError, isPublic, ...config } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  
  const callbacksRef = useRef({ onSuccess, onError });

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const fetchData = useCallback(async () => {
    if (!enabled || !debouncedTerm) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await request(
        {
          ...config,
          params: {
            ...config.params,
            search: debouncedTerm,
          },
        },
        isPublic
      );

      setData(result);

      if (callbacksRef.current.onSuccess) {
        callbacksRef.current.onSuccess(result);
      }
    } catch (err) {
      setError(err);

      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedTerm, enabled, isPublic, config]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    loading,
    searchTerm,
    setSearchTerm,
    refetch: fetchData,
  };
}

