export interface Geo {
  lat: string;
  lng: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  company: Company;
}

export type SearchableField = Extract<keyof User, 'name' | 'username' | 'email'>;

export type SortOrder = 'asc' | 'desc';

export function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<User>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.username === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.address === 'object' &&
    candidate.address !== null &&
    typeof candidate.company === 'object' &&
    candidate.company !== null
  );
}

export function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}
