import { describe, expect, it } from 'vitest';
import { makeUser } from '@/test/fixtures';
import {
  formatAddress,
  formatAddressLines,
  getInitials,
  toMapHref,
  toTelHref,
  toWebsiteHref,
} from './format';

describe('getInitials', () => {
  it('returns the first letter of first and last name, uppercased', () => {
    expect(getInitials('Leanne Graham')).toBe('LG');
  });

  it('uses only the first letter when there is a single word', () => {
    expect(getInitials('Kamren')).toBe('K');
  });

  it('uses first and last word for names with more than two parts', () => {
    // Middle name is ignored — only the first and last words count.
    expect(getInitials('Mary Jane Watson')).toBe('MW');
  });

  it('strips common honorifics before deriving initials', () => {
    expect(getInitials('Mrs. Dennis Schulist')).toBe('DS');
    expect(getInitials('Mr. John Doe')).toBe('JD');
    expect(getInitials('Dr. Alice Smith')).toBe('AS');
    expect(getInitials('Prof. Alan Turing')).toBe('AT');
    expect(getInitials('Ms. Jane Doe')).toBe('JD');
    expect(getInitials('Miss Holly Baxter')).toBe('HB');
  });

  it('strips trailing punctuation (periods and commas) from parts', () => {
    // "Mrs." stripped of its period → "Mrs" → honorific → skipped
    expect(getInitials('Mrs. Smith')).toBe('S');
  });

  it('falls back to "?" when every word is an honorific', () => {
    expect(getInitials('Dr. Prof.')).toBe('?');
  });

  it('handles an empty string without throwing', () => {
    expect(getInitials('')).toBe('?');
  });

  it('collapses multiple spaces between words', () => {
    expect(getInitials('Ada   Lovelace')).toBe('AL');
  });

  it('is case-insensitive when checking honorifics', () => {
    expect(getInitials('MR. James Kirk')).toBe('JK');
  });
});

describe('formatAddress', () => {
  it('returns suite, street, city and zipcode as one line', () => {
    const address = makeUser().address;
    expect(formatAddress(address)).toBe('Apt. 556, Kulas Light, Gwenborough 92998-3874');
  });
});

describe('formatAddressLines', () => {
  it('returns three lines: suite, street, city+zip', () => {
    const address = makeUser().address;
    expect(formatAddressLines(address)).toEqual([
      'Apt. 556',
      'Kulas Light',
      'Gwenborough 92998-3874',
    ]);
  });
});

describe('toTelHref', () => {
  it('strips non-digit characters and prepends tel:', () => {
    expect(toTelHref('1-770-736-8031')).toBe('tel:17707368031');
  });

  it('removes an extension (x...) before building the href', () => {
    expect(toTelHref('1-770-736-8031 x56442')).toBe('tel:17707368031');
  });

  it('handles extensions written with a capital X', () => {
    expect(toTelHref('1-770-736-8031 X56442')).toBe('tel:17707368031');
  });

  it('handles extensions with no space before the x', () => {
    expect(toTelHref('1-770-736-8031x56442')).toBe('tel:17707368031');
  });

  it('preserves a leading + for international numbers', () => {
    expect(toTelHref('+44 20 7946 0958')).toBe('tel:+442079460958');
  });

  it('returns a bare tel: link when the number has no special characters', () => {
    expect(toTelHref('17707368031')).toBe('tel:17707368031');
  });
});

describe('toWebsiteHref', () => {
  it('prepends https:// when the value has no scheme', () => {
    expect(toWebsiteHref('hildegard.org')).toBe('https://hildegard.org');
  });

  it('leaves an existing https:// scheme untouched', () => {
    expect(toWebsiteHref('https://example.com')).toBe('https://example.com');
  });

  it('leaves an existing http:// scheme untouched', () => {
    expect(toWebsiteHref('http://example.com')).toBe('http://example.com');
  });

  it('is case-insensitive when detecting an existing scheme', () => {
    expect(toWebsiteHref('HTTPS://example.com')).toBe('HTTPS://example.com');
  });
});

describe('toMapHref', () => {
  it('returns an OpenStreetMap URL with the correct lat/lng', () => {
    const user = makeUser();
    const href = toMapHref(user);
    expect(href).toContain('openstreetmap.org');
    expect(href).toContain(user.address.geo.lat);
    expect(href).toContain(user.address.geo.lng);
  });

  it('includes both the mlat/mlon query params and the map hash fragment', () => {
    const user = makeUser();
    const href = toMapHref(user);
    expect(href).toContain('mlat=-37.3159');
    expect(href).toContain('mlon=81.1496');
    expect(href).toContain('#map=12/-37.3159/81.1496');
  });
});
