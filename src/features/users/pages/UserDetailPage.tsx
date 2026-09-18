import { useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowLeft, AtSign, Building2, Globe, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { ErrorState } from '@/components/ErrorState';
import { DetailField } from '../components/DetailField';
import { UserDetailSkeleton } from '../components/UserCardSkeleton';
import { useUser } from '../hooks/useUser';
import {
  formatAddress,
  formatAddressLines,
  getInitials,
  toMapHref,
  toTelHref,
  toWebsiteHref,
} from '../utils/format';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();

  const { user, loading, error, refetch } = useUser(Number(id));

  const backTo = `/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const goBack = useCallback(() => {
    if (location.key === 'default') {
      navigate(backTo, { replace: true });
    } else {
      navigate(-1);
    }
  }, [location.key, navigate, backTo]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="space-y-8"
      >
        <button
          type="button"
          onClick={goBack}
          className="group inline-flex items-center gap-3 rounded-full pr-4 text-sm font-bold text-ink transition-colors hover:bg-surface"
        >
          <ArrowLeft
            className="grid size-10 rounded-full border border-line p-2 transition-[background-color,color,transform] duration-200 group-hover:-translate-x-0.5 group-hover:bg-ink group-hover:text-canvas"
            aria-hidden="true"
          />
          Back to directory
        </button>

        {loading ? <UserDetailSkeleton /> : null}

        {!loading && error ? (
          <div className="space-y-6">
            <ErrorState title="Profile unavailable" message={error} onRetry={refetch} />
            <p className="text-center text-sm text-muted">
              <Link
                to={backTo}
                className="underline decoration-line underline-offset-4 hover:text-accent"
              >
                Return to the directory
              </Link>
            </p>
          </div>
        ) : null}

        {!loading && !error && user ? (
          <article className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(24rem,.8fr)] lg:gap-20">
            <header className="border-line lg:border-r-2 lg:pr-12">
              <span
                aria-hidden="true"
                className="grid size-24 place-items-center rounded-[1.8rem] bg-accent font-display text-3xl text-accent-ink shadow-[inset_0_0_0_1px_rgba(23,26,24,0.08)]"
              >
                {getInitials(user.name)}
              </span>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                @{user.username}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.88] text-ink">
                {user.name}
              </h1>
              <blockquote className="mt-9 max-w-xl border-l-2 border-accent pl-5 text-lg leading-8 text-muted">
                “{user.company.catchPhrase}”
              </blockquote>
            </header>

            <div className="lg:pt-8">
              <p className="mb-5 flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-muted">
                <span className="h-px w-8 bg-muted" />
                Contact details
              </p>

              <dl className="overflow-hidden rounded-[1.8rem] border border-line bg-surface shadow-[0_1px_0_rgba(23,26,24,0.04)]">
                <DetailField label="Username" icon={UserIcon}>
                  @{user.username}
                </DetailField>

                <DetailField label="Email" icon={AtSign} href={`mailto:${user.email}`}>
                  {user.email}
                </DetailField>

                <DetailField label="Phone" icon={Phone} href={toTelHref(user.phone)}>
                  {user.phone}
                </DetailField>

                <DetailField
                  label="Website"
                  icon={Globe}
                  href={toWebsiteHref(user.website)}
                  external
                >
                  {user.website}
                </DetailField>

                <DetailField label="Company" icon={Building2}>
                  {user.company.name}
                </DetailField>

                <DetailField label="Address" icon={MapPin} href={toMapHref(user)} external>
                  <span className="sr-only">{formatAddress(user.address)}</span>
                  <span aria-hidden="true" className="block">
                    {formatAddressLines(user.address).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </DetailField>
              </dl>

              <a
                href={`mailto:${user.email}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 font-semibold text-canvas transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <AtSign className="size-4" aria-hidden="true" />
                Send a message
              </a>
            </div>
          </article>
        ) : null}
      </m.div>
    </LazyMotion>
  );
}
