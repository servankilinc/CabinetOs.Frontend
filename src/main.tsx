import ReactDOM from "react-dom/client";
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from "react-router/dom";

// #region Layouts
import BaseLayout from './layouts/base.tsx'
import AdminLayout from './layouts/admin.tsx';
import AppLayout from './layouts/app.tsx';
// #endregion

// #region Views
import AppViews from "./views/app"
import AdminViews from "./views/admin"
import AuthViews from "./views/auth"
import ErrorViews from "./views/Error"
// #endregion

import { Provider } from 'react-redux';
import { store } from '@/store/index.ts';

const router = createBrowserRouter([
  {
    Component: BaseLayout,
    children: [
      // #region (1) App-Layer
      {
        path: '/',
        Component: AppLayout,
        children: [
          { index: true, Component: AppViews.Home },
          { path: "/about", Component: AppViews.About },
        ]
      },
      // #endregion

      // #region (2) Admin-Layer
      {
        path: '/admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminViews.Home }
          // { path: "/about", Component: AppViews.About },
        ]
      },
      // #endregion

      // #region (3) Auth-Layer
      {
        path: '/login',
        Component: AuthViews.Login
      },
      {
        path: '/signup',
        Component: AuthViews.Signup
      },
      // #endregion
    ]
  },
  {
    path: "*",
    Component: ErrorViews.NotFoundPage,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
