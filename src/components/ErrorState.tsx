import { RotateCw, TriangleAlert } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  message,
  onRetry,
  title = 'The directory did not load',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-danger/25 bg-danger-soft px-6 py-10 text-center"
    >
      <TriangleAlert className="size-6 text-danger" aria-hidden="true" />

      <div className="space-y-1.5">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        <p className="text-sm leading-relaxed text-muted">{message}</p>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-85"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
