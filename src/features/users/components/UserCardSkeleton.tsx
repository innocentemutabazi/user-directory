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
          className="shimmer flex min-h-72 h-full flex-col gap-4 rounded-card border border-line bg-surface p-5"
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

export function UserDetailSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="shimmer grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(24rem,.8fr)] lg:gap-20"
    >
      <div className="border-line lg:border-r-2 lg:pr-12">
        <Bar className="size-24 rounded-[1.8rem]" />
        <Bar className="mt-8 h-3 w-24" />
        <div className="mt-4 max-w-2xl space-y-3">
          <Bar className="h-16 w-[82%] sm:h-24" />
          <Bar className="h-16 w-[64%] sm:h-24" />
        </div>
        <div className="mt-9 max-w-xl space-y-2 border-l-2 border-accent pl-5">
          <Bar className="h-5 w-[88%]" />
          <Bar className="h-5 w-[58%]" />
        </div>
      </div>

      <div className="lg:pt-8">
        <div className="mb-5 flex items-center gap-3">
          <Bar className="h-px w-8" />
          <Bar className="h-3 w-32" />
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-line bg-surface">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-line p-5 last:border-0">
              <Bar className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bar className="h-2.5 w-20" />
                <Bar className={`h-4 ${index === 5 ? 'w-40' : 'w-44'}`} />
                {index === 5 ? <Bar className="h-4 w-28" /> : null}
              </div>
            </div>
          ))}
        </div>

        <Bar className="mt-4 h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}
