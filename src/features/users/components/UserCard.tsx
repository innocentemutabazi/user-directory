import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { User } from '../types/user';
import { getInitials } from '../utils/format';

interface UserCardProps {
  user: User;
  searchSuffix?: string;
}

export function UserCard({ user, searchSuffix = '' }: UserCardProps) {
  return (
    <Link
      to={`/users/${user.id}${searchSuffix}`}
      aria-label={`View profile for ${user.name}`}
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-card border border-line bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60 focus-visible:-translate-y-0.5 focus-visible:border-accent"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-200 group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />

      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-md bg-accent-soft font-display text-base font-medium text-accent"
        >
          {getInitials(user.name)}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg leading-snug text-ink">{user.name}</h2>
          <p className="truncate text-sm text-muted">@{user.username}</p>
        </div>
      </div>

      <div className="mt-auto space-y-2 border-t border-line pt-3.5">
        <p className="truncate text-sm text-ink" title={user.email}>
          {user.email}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{user.address.city}</span>
        </p>
      </div>
    </Link>
  );
}
