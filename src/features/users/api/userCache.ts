import { fetchUserById } from './usersApi';
import type { User } from '../types/user';

const STALE_TIME_MS = 30_000;

interface CacheEntry {
  user: User;
  fetchedAt: number;
}

const cache = new Map<number, CacheEntry>();
const inFlightRequests = new Map<number, Promise<User>>();

function isStale(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt >= STALE_TIME_MS;
}

function fetchAndCache(id: number): Promise<User> {
  const pending = inFlightRequests.get(id);
  if (pending) return pending;

  const request = fetchUserById(id)
    .then((user) => {
      if (inFlightRequests.get(id) === request) {
        cache.set(id, { user, fetchedAt: Date.now() });
      }
      return user;
    })
    .finally(() => {
      if (inFlightRequests.get(id) === request) inFlightRequests.delete(id);
    });

  inFlightRequests.set(id, request);
  return request;
}

export function readUserCache(id: number): User | null {
  return cache.get(id)?.user ?? null;
}

export function loadUser(id: number): Promise<User> {
  const entry = cache.get(id);
  if (entry) return Promise.resolve(entry.user);
  return fetchAndCache(id);
}

export function revalidateUserIfStale(id: number): Promise<User | null> {
  const entry = cache.get(id);
  if (!entry || !isStale(entry)) {
    return Promise.resolve(entry?.user ?? null);
  }
  return fetchAndCache(id);
}

export function invalidateUserCache(id: number): void {
  cache.delete(id);
  inFlightRequests.delete(id);
}

export function resetUserCacheForTests(): void {
  cache.clear();
  inFlightRequests.clear();
}

export function expireUserCacheForTests(id: number): void {
  const entry = cache.get(id);
  if (entry) entry.fetchedAt = 0;
}
