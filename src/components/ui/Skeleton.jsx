/**
 * Skeleton — animated shimmer placeholder.
 *
 * Usage:
 *   <Skeleton className="h-10 w-full" />
 *   <Skeleton className="h-64 rounded-xl" />
 */
export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-brand-elevated animate-pulse rounded-lg ${className}`}
    />
  )
}

/** Pre-built card skeleton for menu/order lists */
export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

/** Pre-built image card skeleton for menu grid */
export function MenuCardSkeleton() {
  return <Skeleton className="h-60 rounded-xl" />
}
