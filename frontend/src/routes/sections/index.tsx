import {Navigate, useRoutes, Outlet} from 'react-router-dom';
import MainLayout from 'src/layouts/main';
import {mainRoutes, HomePage} from './main';
import {authRoutes} from './auth';
import {dashboardRoutes} from './dashboard';

export default function Router() {
    return useRoutes([
        {
            path: '/',
            element: (
                <MainLayout>
                    <Outlet/>
                </MainLayout>
            ),
            children: [{element: <HomePage/>, index: true}],
        },
        ...authRoutes,
        ...dashboardRoutes,
        ...mainRoutes,
        {path: '*', element: <Navigate to="/404" replace/>},
    ]);
}
