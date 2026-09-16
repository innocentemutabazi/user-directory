import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { NotFoundPage } from '@/components/NotFoundPage';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { UserDetailPage, UserListPage } from '@/features/users';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <UserListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
