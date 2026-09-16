interface UserCardSkeletonProps {
  count?: number;
}

function Bar({ className }: { className: string }) {
  return <span className={`block rounded bg-ink/[0.07] ${className}`} />;
}

export function UserCardSkeleton({ count = 6 }: UserCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="shimmer flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5"
        >
          <div className="flex items-start gap-3.5">
            <Bar className="size-11 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2 pt-1">
              <Bar className="h-4 w-3/5" />
              <Bar className="h-3 w-2/5" />
            </div>
          </div>
          <div className="mt-auto space-y-2.5 border-t border-line pt-3.5">
            <Bar className="h-3.5 w-4/5" />
            <Bar className="h-3.5 w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
}

/** Loading placeholder for the profile page. */
export function UserDetailSkeleton() {
  return (
    <div aria-hidden="true" className="shimmer space-y-10">
      <div className="flex items-center gap-4">
        <Bar className="size-16 rounded-md" />
        <div className="space-y-2.5">
          <Bar className="h-7 w-56" />
          <Bar className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Bar className="h-3 w-20" />
            <Bar className="h-4 w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}
