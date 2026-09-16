import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { makeUser } from '@/test/fixtures';
import { UserCard } from './UserCard';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('UserCard', () => {
  it('shows the full name, email, and city', () => {
    renderWithRouter(<UserCard user={makeUser()} />);

    expect(screen.getByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument();
    expect(screen.getByText('Sincere@april.biz')).toBeInTheDocument();
    expect(screen.getByText('Gwenborough')).toBeInTheDocument();
  });

  it('shows the username prefixed with @', () => {
    renderWithRouter(<UserCard user={makeUser()} />);

    expect(screen.getByText('@Bret')).toBeInTheDocument();
  });

  it('links to the profile route for that user', () => {
    renderWithRouter(<UserCard user={makeUser({ id: 7 })} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/users/7');
  });

  it('carries the current search params into the profile link', () => {
    renderWithRouter(<UserCard user={makeUser({ id: 7 })} searchSuffix="?q=lea&sort=desc" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/users/7?q=lea&sort=desc');
  });

  it('gives the link an accessible name that identifies the person', () => {
    renderWithRouter(<UserCard user={makeUser()} />);

    expect(
      screen.getByRole('link', { name: 'View profile for Leanne Graham' }),
    ).toBeInTheDocument();
  });

  it('exposes the whole card as a single tab stop', () => {
    renderWithRouter(<UserCard user={makeUser()} />);

    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('derives two-letter initials from the name', () => {
    renderWithRouter(<UserCard user={makeUser({ name: 'Ervin Howell' })} />);

    expect(screen.getByText('EH')).toBeInTheDocument();
  });

  it('ignores honorifics when building initials', () => {
    renderWithRouter(<UserCard user={makeUser({ name: 'Mrs. Dennis Schulist' })} />);

    expect(screen.getByText('DS')).toBeInTheDocument();
  });

  it('falls back to a single initial for a one-word name', () => {
    renderWithRouter(<UserCard user={makeUser({ name: 'Kamren' })} />);

    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('truncates rather than wrapping long values', () => {
    const longEmail = 'a-very-long-email-address-indeed@some-extremely-long-domain.example';
    renderWithRouter(<UserCard user={makeUser({ email: longEmail })} />);

    expect(screen.getByText(longEmail)).toHaveClass('truncate');
  });
});
