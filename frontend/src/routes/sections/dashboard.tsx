import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';

import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));

const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));

const BillboardMapPage = lazy(() => import('src/pages/dashboard/map'));
const AdsManagerPage = lazy(() => import('src/pages/dashboard/ads-manager'));
const ScreenManagerPage = lazy(() => import('src/pages/dashboard/screen-manager'));

const CreateCampaignPage = lazy(() => import('src/pages/dashboard/campaigns/create'));
const CampaignDetailsPage = lazy(() => import('src/pages/dashboard/campaigns/details'));
const CampaignEditPage = lazy(() => import('src/pages/dashboard/campaigns/edit'));

const ScreenCreatePage = lazy(() => import('src/pages/dashboard/screens/create'));
const ScreenDetailsPage = lazy(() => import('src/pages/dashboard/screens/details'));
const ScreenEditPage = lazy(() => import('src/pages/dashboard/screens/edit'));
const ScreenContentPage = lazy(() => import('src/pages/dashboard/screens/content'));

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      {
        path: 'user',
        children: [
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
        ],
      },
      { path: 'map', element: <BillboardMapPage /> },
      { path: 'ads-manager', element: <AdsManagerPage /> },
      { path: 'screen-manager', element: <ScreenManagerPage /> },
      { path: 'campaigns/create', element: <CreateCampaignPage /> },
      { path: 'campaigns/:id', element: <CampaignDetailsPage /> },
      { path: 'campaigns/:id/edit', element: <CampaignEditPage /> },
      { path: 'screens/create', element: <ScreenCreatePage /> },
      { path: 'screens/:id', element: <ScreenDetailsPage /> },
      { path: 'screens/:id/edit', element: <ScreenEditPage /> },
      { path: 'screens/:id/content', element: <ScreenContentPage /> },
    ],
  },
];
