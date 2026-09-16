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
      className="rounded-sm text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-accent hover:text-accent"
    >
      {children}
    </a>
  ) : (
    <span className="text-ink">{children}</span>
  );

  return (
    <div className="space-y-1.5">
      <dt className="flex items-center gap-2 text-sm text-muted">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-[15px] leading-relaxed break-words">{value}</dd>
    </div>
  );
}
