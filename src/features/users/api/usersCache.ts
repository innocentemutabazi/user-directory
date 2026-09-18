import { fetchUsers } from './usersApi';
import type { User } from '../types/user';

const STALE_TIME_MS = 30_000;

let cachedUsers: User[] | null = null;
let cachedAt: number | null = null;
let inFlightRequest: Promise<User[]> | null = null;

function isStale(): boolean {
  return cachedAt === null || Date.now() - cachedAt >= STALE_TIME_MS;
}

function fetchAndCache(): Promise<User[]> {
  if (!inFlightRequest) {
    const request = fetchUsers()
      .then((data) => {
        if (inFlightRequest === request) {
          cachedUsers = data;
          cachedAt = Date.now();
        }
        return data;
      })
      .finally(() => {
        if (inFlightRequest === request) inFlightRequest = null;
      });
    inFlightRequest = request;
  }
  return inFlightRequest;
}

export function readUsersCache(): User[] | null {
  return cachedUsers;
}

export function loadUsers(): Promise<User[]> {
  if (cachedUsers) return Promise.resolve(cachedUsers);
  return fetchAndCache();
}

export function revalidateUsersIfStale(): Promise<User[]> {
  if (!cachedUsers || !isStale()) {
    return Promise.resolve(cachedUsers ?? []);
  }
  return fetchAndCache();
}

export function invalidateUsersCache(): void {
  cachedUsers = null;
  cachedAt = null;
  inFlightRequest = null;
}

export function resetUsersCacheForTests(): void {
  cachedUsers = null;
  cachedAt = null;
  inFlightRequest = null;
}

export function expireUsersCacheForTests(): void {
  if (cachedAt !== null) cachedAt = 0;
}
