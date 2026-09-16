import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeUser, mockFetchHttpError, mockFetchSuccess } from '@/test/fixtures';
import { UserDetailPage } from './UserDetailPage';

afterEach(() => {
  vi.unstubAllGlobals();
});

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderDetail(entries: string[] = ['/users/1']) {
  return render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <LocationProbe />
      <Routes>
        <Route path="/" element={<div>Directory home</div>} />
        <Route path="/users/:id" element={<UserDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('UserDetailPage', () => {
  it('shows the full name, email, phone, company, and address', async () => {
    mockFetchSuccess(makeUser());
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument();
    expect(screen.getByText('Sincere@april.biz')).toBeInTheDocument();
    expect(screen.getByText('1-770-736-8031 x56442')).toBeInTheDocument();
    expect(screen.getByText('Gwenborough 92998-3874')).toBeInTheDocument();
    expect(screen.getAllByText('Romaguera-Crona').length).toBeGreaterThan(0);
  });

  it('requests the profile named in the route param', async () => {
    const fetchMock = mockFetchSuccess(makeUser({ id: 5 }));
    renderDetail(['/users/5']);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users/5',
        expect.anything(),
      );
    });
  });

  it('turns the email into a mailto link and the phone into a tel link', async () => {
    mockFetchSuccess(makeUser());
    renderDetail();

    expect(await screen.findByRole('link', { name: 'Sincere@april.biz' })).toHaveAttribute(
      'href',
      'mailto:Sincere@april.biz',
    );
    expect(screen.getByRole('link', { name: '1-770-736-8031 x56442' })).toHaveAttribute(
      'href',
      'tel:17707368031',
    );
  });

  it('adds a scheme to the bare website value', async () => {
    mockFetchSuccess(makeUser());
    renderDetail();

    expect(await screen.findByRole('link', { name: 'hildegard.org' })).toHaveAttribute(
      'href',
      'https://hildegard.org',
    );
  });

  it('returns to the directory when there is no history to go back to', async () => {
    const user = userEvent.setup();
    mockFetchSuccess(makeUser());
    renderDetail(['/users/1?q=lea']);

    await screen.findByRole('heading', { name: 'Leanne Graham' });
    await user.click(screen.getByRole('button', { name: /back to directory/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/?q=lea');
    });
  });

  it('goes back through history when the user arrived from the list', async () => {
    const user = userEvent.setup();
    mockFetchSuccess(makeUser());
    renderDetail(['/', '/users/1']);

    await screen.findByRole('heading', { name: 'Leanne Graham' });
    await user.click(screen.getByRole('button', { name: /back to directory/i }));

    await waitFor(() => {
      expect(screen.getByText('Directory home')).toBeInTheDocument();
    });
  });

  it('shows a not-found message for a profile that does not exist', async () => {
    mockFetchHttpError(404);
    renderDetail(['/users/999']);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/not in the directory/i);
  });

  it('does not call the API for a non-numeric id', async () => {
    const fetchMock = mockFetchSuccess(makeUser());
    renderDetail(['/users/not-an-id']);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
