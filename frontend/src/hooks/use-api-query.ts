import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AxiosRequestConfig } from 'axios';

import { request } from 'src/utils/base-axios';

interface UseApiQueryOptions extends AxiosRequestConfig {
  isPublic?: boolean;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseApiQueryReturn<T = any> {
  data: T | null;
  error: any;
  loading: boolean;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApiQuery<T = any>(options: UseApiQueryOptions): UseApiQueryReturn<T> {
  const { enabled = true, refetchInterval, onSuccess, onError, isPublic, ...config } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  
  const callbacksRef = useRef({ onSuccess, onError });

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  
  const memoizedConfig = useMemo(
    () => ({
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers,
      data: config.data,
    }),
    [config.url, config.method, config.params, config.headers, config.data]
  );

  
  const configKey = useMemo(() => {
    const paramsString = memoizedConfig.params
      ? Object.keys(memoizedConfig.params)
          .filter(
            (key) =>
              memoizedConfig.params![key] !== undefined && memoizedConfig.params![key] !== null
          )
          .map((key) => `${key}=${memoizedConfig.params![key]}`)
          .sort()
          .join('&')
      : '';

    return `${memoizedConfig.url}::${memoizedConfig.method || 'GET'}::${paramsString}`;
  }, [memoizedConfig.url, memoizedConfig.method, memoizedConfig.params]);

  const fetchData = useCallback(async () => {
    if (!enabled || !memoizedConfig.url) return;

    try {
      setLoading(true);
      setError(null);

      const result = await request(memoizedConfig, isPublic);

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
  }, [enabled, isPublic, memoizedConfig]);

  useEffect(() => {
    if (enabled && memoizedConfig.url) {
      fetchData();
    }
    
  }, [configKey, enabled]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        fetchData();
      }, refetchInterval);
      return () => clearInterval(interval);
    }
    return undefined;
    
  }, [refetchInterval, configKey, enabled]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
    setData,
  };
}
