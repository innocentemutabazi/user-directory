import { useCallback, useEffect, useState } from 'react';
import { toErrorMessage } from '@/lib/http';
import { fetchUserById } from '../api/usersApi';
import type { User } from '../types/user';

export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(id: number): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setUser(null);
      setLoading(false);
      setError('That profile is not in the directory.');
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetchUserById(id, controller.signal)
      .then((data) => {
        if (!active) return;
        setUser(data);
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setUser(null);
        setError(toErrorMessage(cause));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, attempt]);

  const refetch = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return { user, loading, error, refetch };
}
