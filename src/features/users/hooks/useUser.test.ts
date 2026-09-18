import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  makeUser,
  mockFetchHttpError,
  mockFetchNetworkError,
  mockFetchSuccess,
} from '@/test/fixtures';
import { expireUserCacheForTests, resetUserCacheForTests } from '../api/userCache';
import { useUser } from './useUser';

beforeEach(() => {
  resetUserCacheForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useUser', () => {
  describe('loading a profile', () => {
    it('starts in a loading state with no data', async () => {
      mockFetchSuccess(makeUser());

      const { result } = renderHook(() => useUser(1));

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('fetches on mount and exposes the user', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1, name: 'Leanne Graham' }));

      const { result } = renderHook(() => useUser(1));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.user?.name).toBe('Leanne Graham');
      expect(result.current.error).toBeNull();
      expect(fetchMock).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users/1',
        expect.objectContaining({ headers: { Accept: 'application/json' } }),
      );
    });

    it('treats a non-numeric id as not found, without calling the API', async () => {
      const fetchMock = mockFetchSuccess(makeUser());

      const { result } = renderHook(() => useUser(NaN));

      expect(result.current.loading).toBe(false);
      await waitFor(() => expect(result.current.error).toMatch(/not in the directory/i));
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('failure handling', () => {
    it('surfaces a friendly message for a 404', async () => {
      mockFetchHttpError(404);

      const { result } = renderHook(() => useUser(999));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/not in the directory/i);
      expect(result.current.user).toBeNull();
    });

    it('surfaces a connection message for a network failure', async () => {
      mockFetchNetworkError();

      const { result } = renderHook(() => useUser(1));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/could not reach/i);
    });

    it('recovers when refetch succeeds after a failure', async () => {
      mockFetchHttpError(500);

      const { result } = renderHook(() => useUser(1));
      await waitFor(() => expect(result.current.error).not.toBeNull());

      mockFetchSuccess(makeUser({ id: 1 }));
      act(() => result.current.refetch());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeNull();
      expect(result.current.user).not.toBeNull();
    });
  });

  describe('session cache', () => {
    it('reuses the cached record on a later mount, without a second network call', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1 }));

      const first = renderHook(() => useUser(1));
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      // Simulates reopening the same profile after Back navigation.
      const second = renderHook(() => useUser(1));

      expect(second.result.current.loading).toBe(false);
      expect(second.result.current.user?.id).toBe(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not share a cache entry between different ids', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        const id = Number(/\/users\/(\d+)$/.exec(url)?.[1]);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => makeUser({ id, name: `User ${id}` }),
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const first = renderHook(() => useUser(1));
      await waitFor(() => expect(first.result.current.loading).toBe(false));

      const second = renderHook(() => useUser(2));
      await waitFor(() => expect(second.result.current.loading).toBe(false));

      expect(first.result.current.user?.name).toBe('User 1');
      expect(second.result.current.user?.name).toBe('User 2');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('shares one in-flight request for the same id across simultaneous mounts', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1 }));

      const first = renderHook(() => useUser(1));
      const second = renderHook(() => useUser(1));

      await waitFor(() => expect(first.result.current.loading).toBe(false));
      await waitFor(() => expect(second.result.current.loading).toBe(false));

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('refetch invalidates only that id and hits the network again', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1 }));

      const { result } = renderHook(() => useUser(1));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.refetch());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('background revalidation', () => {
    it('does not hit the network again on a fresh warm mount', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1 }));

      const first = renderHook(() => useUser(1));
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      renderHook(() => useUser(1));

      await act(async () => {
        await Promise.resolve();
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('silently refetches a stale cached record and swaps in the fresh data', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1, name: 'Leanne Graham' }));

      const first = renderHook(() => useUser(1));
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      expireUserCacheForTests(1);

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => makeUser({ id: 1, name: 'Leanne Graham-Smith' }),
      });

      const second = renderHook(() => useUser(1));

      expect(second.result.current.loading).toBe(false);
      expect(second.result.current.user?.name).toBe('Leanne Graham');

      await waitFor(() => expect(second.result.current.user?.name).toBe('Leanne Graham-Smith'));
      expect(second.result.current.loading).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('keeps showing the cached record if a background revalidation fails', async () => {
      const fetchMock = mockFetchSuccess(makeUser({ id: 1, name: 'Leanne Graham' }));

      const first = renderHook(() => useUser(1));
      await waitFor(() => expect(first.result.current.loading).toBe(false));
      first.unmount();

      expireUserCacheForTests(1);
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      const second = renderHook(() => useUser(1));

      expect(second.result.current.loading).toBe(false);
      expect(second.result.current.user?.name).toBe('Leanne Graham');
      expect(second.result.current.error).toBeNull();

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(second.result.current.user?.name).toBe('Leanne Graham');
      expect(second.result.current.error).toBeNull();
    });
  });

  describe('cleanup', () => {
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

      const { unmount } = renderHook(() => useUser(1));
      unmount();

      await act(async () => {
        resolveResponse({ ok: true, status: 200, json: async () => makeUser({ id: 1 }) });
        await Promise.resolve();
      });

      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
