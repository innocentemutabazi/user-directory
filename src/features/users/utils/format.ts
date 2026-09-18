import type { Address, User } from '../types/user';

const HONORIFICS = new Set(['mr', 'mrs', 'ms', 'miss', 'dr', 'prof']);

export function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[.,]/g, ''))
    .filter((part) => part.length > 0 && !HONORIFICS.has(part.toLowerCase()));

  if (parts.length === 0) return '?';

  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';

  return `${first}${last}`.toUpperCase();
}

export function formatAddress(address: Address): string {
  return `${address.suite}, ${address.street}, ${address.city} ${address.zipcode}`;
}

export function formatAddressLines(address: Address): string[] {
  return [address.suite, address.street, `${address.city} ${address.zipcode}`];
}

export function toTelHref(phone: string): string {
  const [dialable] = phone.split(/\s*x\s*/i);
  return `tel:${(dialable ?? phone).replace(/[^\d+]/g, '')}`;
}

export function toWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export function toMapHref(user: User): string {
  const { lat, lng } = user.address.geo;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}
