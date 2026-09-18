import { useCallback, useEffect, useState } from 'react';
import { toErrorMessage } from '@/lib/http';
import {
  invalidateUserCache,
  loadUser,
  readUserCache,
  revalidateUserIfStale,
} from '../api/userCache';
import type { User } from '../types/user';

export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(id: number): UseUserResult {
  const isValidId = Number.isFinite(id);

  const [user, setUser] = useState<User | null>(() => (isValidId ? readUserCache(id) : null));
  const [loading, setLoading] = useState(() => isValidId && readUserCache(id) === null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setUser(null);
      setLoading(false);
      setError('That profile is not in the directory.');
      return;
    }

    const cached = readUserCache(id);

    if (cached) {
      setUser(cached);
      setLoading(false);
      setError(null);

      let active = true;

      revalidateUserIfStale(id)
        .then((data) => {
          if (!active || !data) return;
          setUser(data);
        })
        .catch(() => {
        });

      return () => {
        active = false;
      };
    }

    let active = true;

    setLoading(true);
    setError(null);

    loadUser(id)
      .then((data) => {
        if (!active) return;
        setUser(data);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setUser(null);
        setError(toErrorMessage(cause));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, attempt]);

  const refetch = useCallback(() => {
    if (Number.isFinite(id)) invalidateUserCache(id);
    setAttempt((current) => current + 1);
  }, [id]);

  return { user, loading, error, refetch };
}
