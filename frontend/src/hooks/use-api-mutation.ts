import { useState, useCallback, useRef, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';

import { request } from 'src/utils/base-axios';

interface UseApiMutationOptions extends Omit<AxiosRequestConfig, 'data'> {
  isPublic?: boolean;
  onSuccess?: (data: any, variables?: any) => void;
  onError?: (error: any, variables?: any) => void;
  onSettled?: (data: any, error: any, variables?: any) => void;
}

interface UseApiMutationReturn<T = any, V = any> {
  data: T | null;
  error: any;
  loading: boolean;
  mutate: (variables?: V) => Promise<T>;
  reset: () => void;
}

export function useApiMutation<T = any, V = any>(
  options: UseApiMutationOptions
): UseApiMutationReturn<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const mutate = useCallback(
    async (variables?: V) => {
      try {
        setLoading(true);
        setError(null);

        const { isPublic, onSuccess, onError, onSettled, ...requestConfig } = optionsRef.current;

        const result = await request(
          {
            ...requestConfig,
            data: variables,
          },
          isPublic
        );

        setData(result);

        if (onSuccess) {
          onSuccess(result, variables);
        }

        if (onSettled) {
          onSettled(result, null, variables);
        }

        return result;
      } catch (err) {
        setError(err);

        const { onError, onSettled } = optionsRef.current;

        if (onError) {
          onError(err, variables);
        }

        if (onSettled) {
          onSettled(null, err, variables);
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
    mutate,
    reset,
  };
}

