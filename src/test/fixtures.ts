import type { User } from '@/features/users/types/user';


export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' },
    },
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
    ...overrides,
  };
}

export const mockUsers: User[] = [
  makeUser({ id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' }),
  makeUser({
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    address: { ...makeUser().address, city: 'Wisokyburgh' },
  }),
  makeUser({
    id: 3,
    name: 'Clementine Bauch',
    username: 'Samantha',
    email: 'Nathan@yesenia.net',
    address: { ...makeUser().address, city: 'McKenziehaven' },
  }),
];

/** Replaces global.fetch with a resolved JSON response. */
export function mockFetchSuccess(payload: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Replaces global.fetch with a non-2xx response. */
export function mockFetchHttpError(status: number) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Replaces global.fetch with a network-level failure. */
export function mockFetchNetworkError() {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Replaces global.fetch with a mock that behaves like the real directory
 * across both endpoints: `/users` resolves with the full list, and
 * `/users/:id` resolves with the matching single record (or a 404).
 *
 * `mockFetchSuccess` returns the same payload for every call, which is fine
 * when a test only exercises one endpoint. Tests that navigate between the
 * list and a profile hit both endpoints and need each to get the shape it
 * actually expects — an array from one, a single object from the other.
 */
export function mockFetchUserDirectory(users: User[]) {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    const detailMatch = /\/users\/(\d+)$/.exec(url);

    if (detailMatch) {
      const id = Number(detailMatch[1]);
      const found = users.find((candidate) => candidate.id === id);
      return Promise.resolve(
        found
          ? { ok: true, status: 200, json: async () => found }
          : { ok: false, status: 404, json: async () => ({}) },
      );
    }

    return Promise.resolve({ ok: true, status: 200, json: async () => users });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
