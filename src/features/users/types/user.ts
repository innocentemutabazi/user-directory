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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isUser(value: unknown): value is User {
  if (!isRecord(value)) return false;

  const address = value.address;
  const company = value.company;

  if (!isRecord(address) || !isRecord(company) || !isRecord(address.geo)) return false;

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.username === 'string' &&
    typeof value.email === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.website === 'string' &&
    typeof address.street === 'string' &&
    typeof address.suite === 'string' &&
    typeof address.city === 'string' &&
    typeof address.zipcode === 'string' &&
    typeof address.geo.lat === 'string' &&
    typeof address.geo.lng === 'string' &&
    typeof company.name === 'string' &&
    typeof company.catchPhrase === 'string' &&
    typeof company.bs === 'string'
  );
}

export function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}
