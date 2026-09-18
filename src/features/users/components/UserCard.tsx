import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin } from 'lucide-react';
import type { User } from '../types/user';
import { getInitials } from '../utils/format';

interface UserCardProps {
  user: User;
  searchSuffix?: string;
}

export function UserCard({ user, searchSuffix = '' }: UserCardProps) {
  const avatarColors = [
    'bg-accent',
    'bg-[#ffc9df]',
    'bg-[#b9ddff]',
    'bg-[#ffd692]',
    'bg-[#cfc7ff]',
  ];
  const avatarColor = avatarColors[user.id % avatarColors.length];

  return (
    <Link
      to={`/users/${user.id}${searchSuffix}`}
      aria-label={`View profile for ${user.name}`}
      className="group relative flex min-h-72 h-full flex-col gap-4 overflow-hidden rounded-card border border-line bg-surface p-5 shadow-[0_1px_0_rgba(23,26,24,0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_18px_45px_rgba(25,29,26,0.1)] focus-visible:-translate-y-1 focus-visible:border-ink focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />

      <div className="flex w-full items-start justify-between gap-3.5">
        <span
          aria-hidden="true"
          className={`grid size-14 shrink-0 place-items-center rounded-2xl ${avatarColor} font-semibold tracking-[0.02em] text-ink`}
        >
          {getInitials(user.name)}
        </span>

        <span className="grid size-10 place-items-center rounded-full border border-line text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-canvas">
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>

      <div className="mt-7 min-w-0">
        <p className="mb-1 truncate text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted">
          @{user.username}
        </p>
        <div className="min-w-0">
          <h2 className="truncate font-display text-[1.55rem] leading-tight text-ink">
            {user.name}
          </h2>
        </div>
      </div>

      <div className="mt-auto space-y-2.5 border-t border-line pt-5 text-sm text-muted">
        <p className="flex min-w-0 items-center gap-2.5">
          <Mail className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="truncate" title={user.email}>
            {user.email}
          </span>
        </p>
        <p className="flex min-w-0 items-center gap-2.5">
          <MapPin className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="truncate" title={user.address.city}>
            {user.address.city}
          </span>
        </p>
      </div>
    </Link>
  );
}
