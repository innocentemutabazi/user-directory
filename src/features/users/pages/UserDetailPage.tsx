import { useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="space-y-8"
    >
      <button
        type="button"
        onClick={goBack}
        className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft
          className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
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
        <article className="space-y-10">
          <header className="flex flex-wrap items-center gap-5">
            <span
              aria-hidden="true"
              className="grid size-16 shrink-0 place-items-center rounded-lg bg-accent-soft font-display text-2xl font-medium text-accent"
            >
              {getInitials(user.name)}
            </span>

            <div className="min-w-0">
              <h1 className="font-display text-4xl leading-tight text-ink">{user.name}</h1>
              <p className="mt-1 text-[15px] text-muted">
                {user.company.name} — {user.company.catchPhrase}
              </p>
            </div>
          </header>

          <dl className="grid gap-x-12 gap-y-7 border-t border-line pt-8 sm:grid-cols-2">
            <DetailField label="Username" icon={UserIcon}>
              @{user.username}
            </DetailField>

            <DetailField label="Email" icon={AtSign} href={`mailto:${user.email}`}>
              {user.email}
            </DetailField>

            <DetailField label="Phone" icon={Phone} href={toTelHref(user.phone)}>
              {user.phone}
            </DetailField>

            <DetailField label="Website" icon={Globe} href={toWebsiteHref(user.website)} external>
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
        </article>
      ) : null}
    </motion.div>
  );
}

export default UserDetailPage;
