import { Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md text-ink transition-colors hover:text-accent"
          >
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded bg-accent font-display text-sm font-medium text-accent-ink"
            >
              D
            </span>
            <span className="font-display text-lg">Directory</span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-muted">
          People data from JSONPlaceholder.
        </div>
      </footer>
    </div>
  );
}
