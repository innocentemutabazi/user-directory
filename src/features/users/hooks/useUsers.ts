import { useCallback, useEffect, useMemo, useState } from 'react';
import { toErrorMessage } from '@/lib/http';
import {
  invalidateUsersCache,
  loadUsers,
  readUsersCache,
  revalidateUsersIfStale,
} from '../api/usersCache';
import type { SearchableField, SortOrder, User } from '../types/user';

export interface UseUsersOptions {
  initialSortOrder?: SortOrder;
  initialQuery?: string;
  searchFields?: readonly SearchableField[];
}

export interface UseUsersResult {
  users: User[];
  allUsers: User[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  sortOrder: SortOrder;
  toggleSortOrder: () => void;
  setSortOrder: (order: SortOrder) => void;
  refetch: () => void;
  isEmpty: boolean;
  resultCount: number;
  totalCount: number;
}

const DEFAULT_SEARCH_FIELDS: readonly SearchableField[] = ['name', 'username', 'email'];

function matchesQuery(user: User, needle: string, fields: readonly SearchableField[]): boolean {
  return fields.some((field) => user[field].toLowerCase().includes(needle));
}

export function useUsers(options: UseUsersOptions = {}): UseUsersResult {
  const {
    initialSortOrder = 'asc',
    initialQuery = '',
    searchFields = DEFAULT_SEARCH_FIELDS,
  } = options;

  const [allUsers, setAllUsers] = useState<User[]>(() => readUsersCache() ?? []);
  const [loading, setLoading] = useState(() => readUsersCache() === null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const cached = readUsersCache();
    if (cached) {
      setAllUsers(cached);
      setLoading(false);
      setError(null);

      let active = true;

      revalidateUsersIfStale()
        .then((data) => {
          if (!active) return;
          setAllUsers(data);
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }

    let active = true;

    setLoading(true);
    setError(null);

    loadUsers()
      .then((data) => {
        if (!active) return;
        setAllUsers(data);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setAllUsers([]);
        setError(toErrorMessage(cause));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const refetch = useCallback(() => {
    invalidateUsersCache();
    setAttempt((current) => current + 1);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  }, []);

  const users = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = needle
      ? allUsers.filter((user) => matchesQuery(user, needle, searchFields))
      : allUsers;

    return filtered.slice().sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [allUsers, query, sortOrder, searchFields]);

  return {
    users,
    allUsers,
    loading,
    error,
    query,
    setQuery,
    clearQuery,
    sortOrder,
    toggleSortOrder,
    setSortOrder,
    refetch,
    isEmpty: !loading && !error && users.length === 0,
    resultCount: users.length,
    totalCount: allUsers.length,
  };
}
