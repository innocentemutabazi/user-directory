import { getJson } from '@/lib/http';
import { isUser, isUserArray, type User } from '../types/user';

export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const data = await getJson('/users', signal);

  if (!isUserArray(data)) {
    throw new Error('The directory returned data in an unexpected format.');
  }

  return data;
}

export async function fetchUserById(id: number, signal?: AbortSignal): Promise<User> {
  const data = await getJson(`/users/${id}`, signal);

  if (!isUser(data)) {
    throw new Error('That profile came back in an unexpected format.');
  }

  return data;
}
