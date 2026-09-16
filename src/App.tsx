import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

/**
 * Application root.
 *
 * Kept to a single responsibility — mounting the router — so the route table
 * in `src/app/router.tsx` stays the one place routing is described.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
