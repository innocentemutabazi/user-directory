import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SearchBar } from '../components/SearchBar';
import { SortToggle } from '../components/SortToggle';
import { UserCard } from '../components/UserCard';
import { UserCardSkeleton } from '../components/UserCardSkeleton';
import { useUsers } from '../hooks/useUsers';

const GRID_CLASSES = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

export function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();

  const {
    users,
    loading,
    error,
    query,
    setQuery,
    clearQuery,
    sortOrder,
    toggleSortOrder,
    refetch,
    isEmpty,
    resultCount,
    totalCount,
  } = useUsers({
    initialQuery: searchParams.get('q') ?? '',
    initialSortOrder: searchParams.get('sort') === 'desc' ? 'desc' : 'asc',
  });

  const serialisedParams = searchParams.toString();
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query);
    if (sortOrder !== 'asc') next.set('sort', sortOrder);

    if (next.toString() !== serialisedParams) {
      setSearchParams(next, { replace: true });
    }
  }, [query, sortOrder, serialisedParams, setSearchParams]);

  const hasRevealed = useRef(false);
  useEffect(() => {
    if (!loading && users.length > 0) hasRevealed.current = true;
  }, [loading, users.length]);

  const shouldStagger = !reduceMotion && !hasRevealed.current;
  const searchSuffix = serialisedParams ? `?${serialisedParams}` : '';

  const resultSummary = loading
    ? 'Loading the directory'
    : error
      ? 'The directory could not be loaded'
      : `${resultCount} of ${totalCount} ${totalCount === 1 ? 'person' : 'people'} shown`;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-[2.75rem]">
          Staff directory
        </h1>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted">
          Find a colleague and open their profile for full contact details.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={clearQuery}
          disabled={Boolean(error)}
        />
        <SortToggle
          sortOrder={sortOrder}
          onToggle={toggleSortOrder}
          disabled={loading || Boolean(error)}
        />
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {resultSummary}
      </p>

      {loading ? (
        <div className={GRID_CLASSES}>
          <UserCardSkeleton count={6} />
        </div>
      ) : null}

      {!loading && error ? <ErrorState message={error} onRetry={refetch} /> : null}

      {isEmpty ? <EmptyState query={query.trim() || undefined} onClear={clearQuery} /> : null}

      {!loading && !error && users.length > 0 ? (
        <LazyMotion features={domAnimation}>
          <m.ul className={GRID_CLASSES}>
            {users.map((user, index) => (
              <m.li
                key={user.id}
                layout={!reduceMotion}
                initial={shouldStagger ? { opacity: 0, y: 12 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                  delay: shouldStagger ? Math.min(index, 8) * 0.045 : 0,
                }}
              >
                <UserCard user={user} searchSuffix={searchSuffix} />
              </m.li>
            ))}
          </m.ul>
        </LazyMotion>
      ) : null}
    </div>
  );
}
