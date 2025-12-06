import React, {lazy, Suspense} from 'react';
import {Outlet} from 'react-router-dom';
import MainLayout from 'src/layouts/main';
import CompactLayout from 'src/layouts/compact';
import ServePage from "../../pages/serve";

export const HomePage = lazy(() => import('src/pages/home'));
const Page500 = lazy(() => import('src/pages/500'));
const Page403 = lazy(() => import('src/pages/403'));
const Page404 = lazy(() => import('src/pages/404'));
const AboutPage = lazy(() => import('src/pages/about-us'));
const ContactPage = lazy(() => import('src/pages/contact-us'));

export const mainRoutes = [
    {
        element: (
            <MainLayout>
                <Outlet/>
            </MainLayout>
        ),
        children: [
            {path: 'serve/:id', element: <Suspense fallback={<div>Loading...</div>}><ServePage/></Suspense>},
            {path: 'about-us', element: <AboutPage/>},
            {path: 'contact-us', element: <ContactPage/>},
        ],
    },
    {
        element: (
            <CompactLayout>
                <Outlet/>
            </CompactLayout>
        ),
        children: [
            {path: '500', element: <Page500/>},
            {path: '404', element: <Page404/>},
            {path: '403', element: <Page403/>},
        ],
    },
];
