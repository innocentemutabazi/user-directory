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
      className="mx-auto flex min-h-72 max-w-2xl flex-col items-center justify-center gap-4 rounded-[2rem] border border-danger/25 bg-danger-soft px-6 py-10 text-center"
    >
      <TriangleAlert className="size-6 text-danger" aria-hidden="true" />

      <div className="space-y-1.5">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="text-sm leading-relaxed text-muted">{message}</p>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-canvas transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-ink/80"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
