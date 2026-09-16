import { ArrowDownAZ, ArrowDownZA } from 'lucide-react';
import type { SortOrder } from '../types/user';

interface SortToggleProps {
  sortOrder: SortOrder;
  onToggle: () => void;
  disabled?: boolean;
}

export function SortToggle({ sortOrder, onToggle, disabled = false }: SortToggleProps) {
  const isAscending = sortOrder === 'asc';
  const Icon = isAscending ? ArrowDownAZ : ArrowDownZA;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={!isAscending}
      title={isAscending ? 'Sorted A to Z. Click to reverse.' : 'Sorted Z to A. Click to reverse.'}
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-60 disabled:hover:border-line disabled:hover:text-ink"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span>{isAscending ? 'A–Z' : 'Z–A'}</span>
    </button>
  );
}
