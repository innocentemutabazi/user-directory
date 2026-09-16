import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
      <SearchX className="size-6 text-muted" aria-hidden="true" />

      <div className="space-y-1.5">
        <h2 className="font-display text-xl text-ink">No one matches “{query}”</h2>
        <p className="text-sm leading-relaxed text-muted">
          Search by name, username, or email address.
        </p>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-line bg-raised px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
      >
        Show everyone
      </button>
    </div>
  );
}
