import { fetchUsers } from './usersApi';
import type { User } from '../types/user';



let cachedUsers: User[] | null = null;
let inFlightRequest: Promise<User[]> | null = null;

export function readUsersCache(): User[] | null {
  return cachedUsers;
}


export function loadUsers(): Promise<User[]> {
  if (cachedUsers) return Promise.resolve(cachedUsers);

  if (!inFlightRequest) {
    inFlightRequest = fetchUsers()
      .then((data) => {
        cachedUsers = data;
        return data;
      })
      .finally(() => {
        inFlightRequest = null;
      });
  }

  return inFlightRequest;
}

export function invalidateUsersCache(): void {
  cachedUsers = null;
  inFlightRequest = null;
}

export function resetUsersCacheForTests(): void {
  cachedUsers = null;
  inFlightRequest = null;
}
