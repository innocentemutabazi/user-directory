import type { User } from '@/features/users/types/user';

/**
 * Hand-built fixtures rather than a dump of the live API response.
 *
 * The names are chosen to exercise the behaviour under test: mixed casing for
 * the case-insensitive filter, and a deliberate A–Z ordering that differs from
 * the array order so sorting cannot pass by accident.
 */
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
