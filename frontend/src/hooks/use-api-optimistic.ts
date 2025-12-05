import { useState, useCallback, useRef, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';

import { request } from 'src/utils/base-axios';

interface UseApiOptimisticOptions<T> extends Omit<AxiosRequestConfig, 'data'> {
  isPublic?: boolean;
  onSuccess?: (data: T, variables?: any) => void;
  onError?: (error: any, variables?: any, rollbackData?: T | null) => void;
}

interface UseApiOptimisticReturn<T = any, V = any> {
  data: T | null;
  error: any;
  loading: boolean;
  mutate: (
    variables: V,
    optimisticData?: T | ((current: T | null) => T)
  ) => Promise<T>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  reset: () => void;
}

export function useApiOptimistic<T = any, V = any>(
  options: UseApiOptimisticOptions<T>
): UseApiOptimisticReturn<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const mutate = useCallback(
    async (variables: V, optimisticData?: T | ((current: T | null) => T)) => {
      try {
        
        let rollbackData: T | null = null;

        setData((currentData) => {
          rollbackData = currentData;

          if (optimisticData) {
            if (typeof optimisticData === 'function') {
              
              const updater = optimisticData as (current: T | null) => T;
              return updater(currentData);
            }
            return optimisticData;
          }

          return currentData;
        });

        setLoading(true);
        setError(null);

        const { isPublic, onSuccess, onError, ...requestConfig } = optionsRef.current;

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

        return result;
      } catch (err) {
        
        setData((currentData) => {
          
          const dataRef = { current: currentData };
          return dataRef.current;
        });

        setError(err);

        const { onError } = optionsRef.current;

        if (onError) {
          setData((rollbackData) => {
            onError(err, variables, rollbackData);
            return rollbackData;
          });
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
    setData,
    reset,
  };
}

