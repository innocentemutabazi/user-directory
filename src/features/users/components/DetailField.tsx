import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DetailFieldProps {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  href?: string;
  external?: boolean;
}

export function DetailField({
  label,
  icon: Icon,
  children,
  href,
  external = false,
}: DetailFieldProps) {
  const value = href ? (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="group/link block min-w-0 text-ink transition-colors hover:bg-raised"
    >
      {children}
    </a>
  ) : (
    <span className="block min-w-0 text-ink">{children}</span>
  );

  return (
    <div className="flex items-center gap-4 border-b border-line p-5 last:border-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-raised text-muted">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-muted">{label}</dt>
        <dd className="mt-1.5 break-words text-[0.95rem] leading-relaxed">{value}</dd>
      </div>
    </div>
  );
}
