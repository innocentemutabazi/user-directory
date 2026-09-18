import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, LazyMotion, domMax, m, useReducedMotion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SearchBar } from '../components/SearchBar';
import { SortToggle } from '../components/SortToggle';
import { UserCard } from '../components/UserCard';
import { UserCardSkeleton } from '../components/UserCardSkeleton';
import { useUsers } from '../hooks/useUsers';

const GRID_CLASSES = 'grid gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

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
    <div className="space-y-9">
      <header className="space-y-4 pt-2 sm:pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">People directory</p>
        <h1 className="max-w-4xl font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] text-ink">
          Staff directory
        </h1>
        <p className="max-w-[54ch] text-base leading-relaxed text-muted sm:text-lg">
          Find a colleague and open their profile for full contact details.
        </p>
      </header>

      <div className="flex flex-col gap-3 border-y border-line py-5 sm:flex-row sm:items-center">
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

      <p
        role="status"
        aria-live="polite"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
      >
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
        <LazyMotion features={domMax}>
          <m.ul className={GRID_CLASSES} layout={!reduceMotion}>
            <AnimatePresence initial={false} mode="popLayout">
              {users.map((user, index) => (
                <m.li
                  key={user.id}
                  layout={reduceMotion ? false : 'position'}
                  layoutId={`user-card-${user.id}`}
                  initial={shouldStagger ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 260, damping: 25, mass: 0.8 },
                    opacity: { duration: 0.24 },
                    scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                    y: {
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                      delay: shouldStagger ? Math.min(index, 8) * 0.045 : 0,
                    },
                  }}
                >
                  <UserCard user={user} searchSuffix={searchSuffix} />
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
        </LazyMotion>
      ) : null}
    </div>
  );
}
