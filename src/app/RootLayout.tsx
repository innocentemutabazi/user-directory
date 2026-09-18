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

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md text-ink transition-colors hover:text-accent"
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-accent font-display text-base text-accent-ink"
            >
              D
            </span>
            <span className="font-display text-xl">Directory</span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <main
        id="main"
        className="mx-auto w-full max-w-[90rem] flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      >
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-2 px-5 py-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>Staff directory</span>
          <span>People data from JSONPlaceholder</span>
        </div>
      </footer>
    </div>
  );
}
