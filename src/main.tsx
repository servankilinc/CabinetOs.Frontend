import ReactDOM from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import '@/styles/index.css';

// #region Layouts
import BaseLayout from './layouts/base.tsx';
import AdminLayout from './layouts/admin.tsx';
import AppLayout from './layouts/app.tsx';
// #endregion

// #region Views
import AppViews from './views/app';
import AdminViews from './views/admin';
import AuthViews from './views/auth';
import ErrorViews from './views/Error';
// #endregion

import { Provider } from 'react-redux';
import { store } from '@/store/index.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApiError } from '@/lib/axios-helper.ts';
import RequireAuth from '@/components/custom/require-auth.tsx';

const queryClient = new QueryClient({
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

const router = createBrowserRouter([
  {
    Component: BaseLayout,
    children: [
      // #region (1) App-Layer
      {
        Component: RequireAuth,
        children: [
          {
            path: '/',
            Component: AppLayout,
            children: [
              { index: true, Component: AppViews.Home },
              { path: '/about', Component: AppViews.About }
            ]
          },
          // #endregion

          // #region (2) Admin-Layer
          {
            path: '/admin',
            Component: AdminLayout,
            children: [{ index: true, Component: AdminViews.Home }]
          }
          // #endregion
        ]
      },

      // #region (3) Auth-Layer (acik)
      { path: '/login', Component: AuthViews.Login },
      { path: '/signup', Component: AuthViews.Signup }
      // #endregion
    ]
  },
  {
    path: '*',
    Component: ErrorViews.NotFoundPage
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </Provider>
);
