/**
 * PageLoader — full-page loading state used during:
 *   - Auth rehydration (waiting for /me)
 *   - Suspense fallbacks
 *   - Route-level data loading
 */
export default function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner ring */}
        <div className="w-10 h-10 rounded-full border-2 border-brand-border
                        border-t-brand-accent animate-spin" />
        <p className="text-brand-muted text-sm">Loading…</p>
      </div>
    </div>
  )
}
