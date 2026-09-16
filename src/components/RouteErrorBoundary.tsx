import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorState } from './ErrorState';

export function RouteErrorBoundary() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-16">
      <ErrorState
        title="Something broke"
        message={message}
        onRetry={() => window.location.assign('/')}
      />
    </div>
  );
}
