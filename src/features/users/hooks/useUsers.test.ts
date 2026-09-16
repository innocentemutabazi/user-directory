import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  mockFetchHttpError,
  mockFetchNetworkError,
  mockFetchSuccess,
  mockUsers,
} from '@/test/fixtures';
import { useUsers } from './useUsers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useUsers', () => {
  describe('loading the directory', () => {
    it('starts in a loading state with no data', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());

      expect(result.current.loading).toBe(true);
      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBeNull();

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('fetches on mount and exposes the users', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.users).toHaveLength(3);
      expect(result.current.totalCount).toBe(3);
      expect(result.current.error).toBeNull();
      expect(fetchMock).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  describe('sorting', () => {
    it('sorts A–Z by name by default', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.users.map((user) => user.name)).toEqual([
        'Clementine Bauch',
        'Ervin Howell',
        'Leanne Graham',
      ]);
    });

    it('reverses to Z–A when toggled, and back again', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.toggleSortOrder());

      expect(result.current.sortOrder).toBe('desc');
      expect(result.current.users.map((user) => user.name)).toEqual([
        'Leanne Graham',
        'Ervin Howell',
        'Clementine Bauch',
      ]);

      act(() => result.current.toggleSortOrder());
      expect(result.current.sortOrder).toBe('asc');
    });

    it('honours an initial sort order', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers({ initialSortOrder: 'desc' }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.users[0]?.name).toBe('Leanne Graham');
    });
  });

  describe('searching', () => {
    it('filters by name, ignoring case', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('lEaNnE'));

      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0]?.name).toBe('Leanne Graham');
      expect(result.current.resultCount).toBe(1);
      expect(result.current.totalCount).toBe(3);
    });

    it('matches partial substrings anywhere in the name', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('how'));

      expect(result.current.users.map((user) => user.name)).toEqual(['Ervin Howell']);
    });

    it('also matches username and email', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('antonette'));
      expect(result.current.users.map((user) => user.name)).toEqual(['Ervin Howell']);

      act(() => result.current.setQuery('yesenia'));
      expect(result.current.users.map((user) => user.name)).toEqual(['Clementine Bauch']);
    });

    it('can be restricted to the name field only', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers({ searchFields: ['name'] }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('antonette'));

      expect(result.current.users).toEqual([]);
      expect(result.current.isEmpty).toBe(true);
    });

    it('ignores surrounding whitespace', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('   graham   '));

      expect(result.current.users).toHaveLength(1);
    });

    it('reports an empty state when nothing matches', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('zzzz'));

      expect(result.current.users).toEqual([]);
      expect(result.current.isEmpty).toBe(true);
    });

    it('is not empty while the request is still in flight', async () => {
      mockFetchSuccess([]);

      const { result } = renderHook(() => useUsers());

      expect(result.current.isEmpty).toBe(false);

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isEmpty).toBe(true);
    });

    it('restores the full list when the query is cleared', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('leanne'));
      expect(result.current.users).toHaveLength(1);

      act(() => result.current.clearQuery());
      expect(result.current.users).toHaveLength(3);
      expect(result.current.query).toBe('');
    });

    it('keeps the sort order applied to filtered results', async () => {
      mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers({ initialSortOrder: 'desc' }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setQuery('e'));

      const names = result.current.users.map((user) => user.name);
      expect(names).toEqual([...names].sort().reverse());
    });
  });

  describe('failure handling', () => {
    it('surfaces a friendly message for a server error', async () => {
      mockFetchHttpError(500);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/not responding/i);
      expect(result.current.users).toEqual([]);
    });

    it('surfaces a connection message for a network failure', async () => {
      mockFetchNetworkError();

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/could not reach/i);
    });

    it('rejects a payload that is not a list of users', async () => {
      mockFetchSuccess([{ id: 'not-a-number' }]);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/unexpected format/i);
    });

    it('recovers when refetch succeeds after a failure', async () => {
      mockFetchHttpError(500);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.error).not.toBeNull());

      mockFetchSuccess(mockUsers);
      act(() => result.current.refetch());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeNull();
      expect(result.current.users).toHaveLength(3);
    });
  });

  describe('cleanup', () => {
    it('aborts the in-flight request on unmount', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const { unmount } = renderHook(() => useUsers());
      const signal = fetchMock.mock.calls[0]?.[1]?.signal as AbortSignal;

      expect(signal.aborted).toBe(false);
      unmount();
      expect(signal.aborted).toBe(true);
    });
  });
});
