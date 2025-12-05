import { useState, useCallback, useRef, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';

import { request } from 'src/utils/base-axios';

interface UseApiOptions extends AxiosRequestConfig {
  isPublic?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseApiReturn<T = any> {
  data: T | null;
  error: any;
  loading: boolean;
  execute: (overrideOptions?: Partial<UseApiOptions>) => Promise<T>;
  reset: () => void;
}

export function useApi<T = any>(options: UseApiOptions): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const execute = useCallback(
    async (overrideOptions?: Partial<UseApiOptions>) => {
      try {
        setLoading(true);
        setError(null);

        const mergedOptions = { ...optionsRef.current, ...overrideOptions };
        const { isPublic, onSuccess, onError, ...requestConfig } = mergedOptions;

        const result = await request(requestConfig, isPublic);

        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        if (optionsRef.current.onError) {
          optionsRef.current.onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [] 
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
}

