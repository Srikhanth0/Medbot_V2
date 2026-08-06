import React, { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';

// Lazy load pages
const LandingPage = lazy(() => import('@/pages/Landing'));
const LoginPage = lazy(() => import('@/pages/Login'));
const SignUpPage = lazy(() => import('@/pages/SignUp'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const ChatPage = lazy(() => import('@/pages/Chat'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
const IntegrationPage = lazy(() => import('@/pages/Integration'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

/**
 * Application Routes Configuration with Route Guards
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        element: (
          <AuthGuard requireAuth={false}>
            <AuthLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'signup',
            element: <SignUpPage />,
          }
        ]
      },
      {
        path: 'dashboard',
        element: (
          <AuthGuard requireAuth={true}>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'integration',
            element: <IntegrationPage />,
          },
          {
            path: 'calendar',
            element: <CalendarPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          }
        ]
      },
      {
        path: 'profile',
        element: (
          <AuthGuard requireAuth={true}>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: <ProfilePage />,
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />,
      }
    ],
  },
]);

/**
 * Main App Router Component
 */
export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};
export default AppRoutes;
