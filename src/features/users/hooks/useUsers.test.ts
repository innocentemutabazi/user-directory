import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
  mockFetchHttpError,
  mockFetchNetworkError,
  mockFetchSuccess,
  mockUsers,
} from '@/test/fixtures';
import { resetUsersCacheForTests, expireUsersCacheForTests } from '../api/usersCache';
import { useUsers } from './useUsers';

beforeEach(() => {
  resetUsersCacheForTests();
});

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
        expect.objectContaining({ headers: { Accept: 'application/json' } }),
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

  describe('session cache', () => {
    it('reuses the cached list on a later mount, without a second network call', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const first = renderHook(() => useUsers());
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      // Simulates remounting UserListPage after Back navigation.
      const second = renderHook(() => useUsers());

      // The lazy initializer seeds state from the cache synchronously, so
      // there is no loading flash on this second mount.
      expect(second.result.current.loading).toBe(false);
      expect(second.result.current.users).toHaveLength(3);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('shares one in-flight request across simultaneous mounts', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const first = renderHook(() => useUsers());
      const second = renderHook(() => useUsers());

      await waitFor(() => expect(first.result.current.loading).toBe(false));
      await waitFor(() => expect(second.result.current.loading).toBe(false));

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(first.result.current.users).toHaveLength(3);
      expect(second.result.current.users).toHaveLength(3);
    });

    it('refetch invalidates the cache and hits the network again', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const { result } = renderHook(() => useUsers());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.refetch());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.current.users).toHaveLength(3);
    });

    it('does not update state if the request resolves after unmount', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      let resolveResponse: (value: {
        ok: boolean;
        status: number;
        json: () => Promise<unknown>;
      }) => void = () => {};
      const fetchMock = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveResponse = resolve;
          }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const { unmount } = renderHook(() => useUsers());
      unmount();

      await act(async () => {
        resolveResponse({ ok: true, status: 200, json: async () => mockUsers });
        await Promise.resolve();
      });

      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('background revalidation', () => {
    it('does not hit the network again on a fresh warm mount', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const first = renderHook(() => useUsers());
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      renderHook(() => useUsers());
      await act(async () => {
        await Promise.resolve();
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('silently refetches a stale cached list and swaps in the fresh data', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const first = renderHook(() => useUsers());
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      expireUsersCacheForTests();

      const changedOnBackend = mockUsers.slice(0, 2);
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => changedOnBackend,
      });

      const second = renderHook(() => useUsers());

      expect(second.result.current.loading).toBe(false);
      expect(second.result.current.users).toHaveLength(3);

      await waitFor(() => expect(second.result.current.users).toHaveLength(2));
      expect(second.result.current.loading).toBe(false);

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('keeps showing the cached list if a background revalidation fails', async () => {
      const fetchMock = mockFetchSuccess(mockUsers);

      const first = renderHook(() => useUsers());
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      expireUsersCacheForTests();
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      const second = renderHook(() => useUsers());

      expect(second.result.current.loading).toBe(false);
      expect(second.result.current.users).toHaveLength(3);
      expect(second.result.current.error).toBeNull();

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(second.result.current.users).toHaveLength(3);
      expect(second.result.current.error).toBeNull();
    });
  });
});
