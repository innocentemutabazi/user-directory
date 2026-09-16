import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockFetchHttpError, mockFetchSuccess, mockUsers } from '@/test/fixtures';
import { UserListPage } from './UserListPage';

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <UserListPage />
    </MemoryRouter>,
  );
}

async function waitForList() {
  return waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
}

describe('UserListPage', () => {
  it('renders every user once the request resolves', async () => {
    mockFetchSuccess(mockUsers);
    renderPage();

    await waitForList();

    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument();
  });

  it('shows a result count', async () => {
    mockFetchSuccess(mockUsers);
    renderPage();

    await waitForList();

    expect(screen.getByText('3 of 3 people shown')).toBeInTheDocument();
  });

  it('filters the grid as the user types', async () => {
    const user = userEvent.setup();
    mockFetchSuccess(mockUsers);
    renderPage();

    await waitForList();

    await user.type(screen.getByRole('searchbox'), 'ervin');

    await waitFor(() => {
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
    });
    expect(screen.getByRole('heading', { name: 'Ervin Howell' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Leanne Graham' })).not.toBeInTheDocument();
  });

  it('shows the empty state when the query matches no one', async () => {
    const user = userEvent.setup();
    mockFetchSuccess(mockUsers);
    renderPage();

    await waitForList();
    await user.type(screen.getByRole('searchbox'), 'nobody');

    expect(await screen.findByText(/no one matches/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('restores the full list from the empty state', async () => {
    const user = userEvent.setup();
    mockFetchSuccess(mockUsers);
    renderPage();

    await waitForList();
    await user.type(screen.getByRole('searchbox'), 'nobody');

    await user.click(await screen.findByRole('button', { name: 'Show everyone' }));

    await waitFor(() => {
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(3);
    });
  });

  it('reverses the order when the sort toggle is pressed', async () => {
    const user = userEvent.setup();
    mockFetchSuccess(mockUsers);
    renderPage();

    await waitForList();

    const readNames = () =>
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

    expect(readNames()).toEqual(['Clementine Bauch', 'Ervin Howell', 'Leanne Graham']);

    await user.click(screen.getByRole('button', { name: /a–z/i }));

    await waitFor(() => {
      expect(readNames()).toEqual(['Leanne Graham', 'Ervin Howell', 'Clementine Bauch']);
    });
  });

  it('applies a query supplied in the URL on first render', async () => {
    mockFetchSuccess(mockUsers);
    renderPage('/?q=clementine');

    await waitForList();

    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('searchbox')).toHaveValue('clementine');
  });

  it('applies a sort order supplied in the URL on first render', async () => {
    mockFetchSuccess(mockUsers);
    renderPage('/?sort=desc');

    await waitForList();

    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('Leanne Graham');
  });

  it('shows an alert with a retry action when the request fails', async () => {
    const user = userEvent.setup();
    mockFetchHttpError(500);
    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/not responding/i);

    mockFetchSuccess(mockUsers);
    await user.click(within(alert).getByRole('button', { name: /try again/i }));

    await waitForList();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
