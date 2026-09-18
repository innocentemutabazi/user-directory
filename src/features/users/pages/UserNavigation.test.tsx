import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFetchUserDirectory, mockUsers } from '@/test/fixtures';
import { resetUsersCacheForTests } from '../api/usersCache';
import { resetUserCacheForTests } from '../api/userCache';
import { UserDetailPage } from './UserDetailPage';
import { UserListPage } from './UserListPage';

beforeEach(() => {
  resetUsersCacheForTests();
  resetUserCacheForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<UserListPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function listRequestCount(fetchMock: ReturnType<typeof mockFetchUserDirectory>) {
  return fetchMock.mock.calls.filter(([url]) => (url as string).endsWith('/users')).length;
}

describe('list → detail → back navigation', () => {
  it('does not refetch the list when returning from a profile', async () => {
    const fetchMock = mockFetchUserDirectory(mockUsers);
    const user = userEvent.setup();

    renderApp();
    await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
    expect(listRequestCount(fetchMock)).toBe(1);

    await user.click(screen.getByRole('link', { name: 'View profile for Leanne Graham' }));
    await screen.findByRole('heading', { name: 'Leanne Graham' });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: /back to directory/i }));

    await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
    expect(listRequestCount(fetchMock)).toBe(1);
  });

  it('shows the full list immediately on return, with no loading skeleton', async () => {
    mockFetchUserDirectory(mockUsers);
    const user = userEvent.setup();

    renderApp();
    await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());

    await user.click(screen.getByRole('link', { name: 'View profile for Leanne Graham' }));
    await screen.findByRole('heading', { name: 'Leanne Graham' });
    await user.click(screen.getByRole('button', { name: /back to directory/i }));

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('keeps the filtered search state intact across the round trip', async () => {
    mockFetchUserDirectory(mockUsers);
    const user = userEvent.setup();

    renderApp();
    await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());

    await user.type(screen.getByRole('searchbox'), 'ervin');
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));

    await user.click(screen.getByRole('link', { name: 'View profile for Ervin Howell' }));
    await screen.findByRole('heading', { name: 'Ervin Howell' });

    await user.click(screen.getByRole('button', { name: /back to directory/i }));

    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue('ervin'));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
