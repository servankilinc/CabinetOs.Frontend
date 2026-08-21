import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // 4xx tekrar denemekle duzelmez; 401'de interceptor oturumu zaten
        // temizledi, buradan tekrar denemek yalnizca gurultu uretir.
        // Transport katmani her hatayi ApiError'a cevirdigi icin AxiosError
        // tanimaya gerek yok.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      }
    },
    mutations: {
      retry: false
    }
  }
});
