import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="font-display text-4xl text-ink">Page not found</h1>
      <p className="text-[15px] leading-relaxed text-muted">
        That URL does not match anything in the directory.
      </p>
      <Link
        to="/"
        className="inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-canvas transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-ink/80"
      >
        Go to the directory
      </Link>
    </div>
  );
}
