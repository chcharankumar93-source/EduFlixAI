export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-56 animate-pulse" aria-hidden="true">
      <div className="h-32 rounded-lg bg-white/5" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map(i => (
        <div key={i}>
          <div className="h-6 w-48 rounded bg-white/10 animate-pulse mb-3" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, j) => <CardSkeleton key={j} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
