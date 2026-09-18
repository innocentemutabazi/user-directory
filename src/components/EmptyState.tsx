import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  query?: string;
  onClear: () => void;
}

export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-72 max-w-2xl flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-line bg-surface px-6 py-14 text-center">
      <SearchX className="size-7 text-muted" aria-hidden="true" />

      <div className="space-y-1.5">
        <h2 className="font-display text-2xl text-ink">
          {query ? `No one matches “${query}”` : 'No people found'}
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          {query
            ? 'Search by name, username, or email address.'
            : 'There are no people to display right now.'}
        </p>
      </div>

      {query ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-line bg-raised px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
        >
          Show everyone
        </button>
      ) : null}
    </div>
  );
}
