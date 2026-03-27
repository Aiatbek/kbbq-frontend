// Stub pages — replace each with full implementations in later phases.
// Each file exports a simple placeholder so the router works from day one.

export function MenuPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-brand-primary mb-2">Our Menu</h1>
      <p className="text-brand-muted">Menu page coming in Phase 3.</p>
    </div>
  )
}

export function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl text-brand-dark mb-6">Login</h1>
      <p className="text-gray-500">Login form coming in Phase 2.</p>
    </div>
  )
}

export function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl text-brand-dark mb-6">Create Account</h1>
      <p className="text-gray-500">Register form coming in Phase 2.</p>
    </div>
  )
}

export function ReservationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-brand-primary mb-2">Book a Table</h1>
      <p className="text-brand-muted">Reservation form coming in Phase 5.</p>
    </div>
  )
}

export function MyOrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-brand-primary mb-2">My Orders</h1>
      <p className="text-brand-muted">Orders page coming in Phase 6.</p>
    </div>
  )
}

export function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-brand-primary mb-2">Admin Dashboard</h1>
      <p className="text-brand-muted">Admin area coming in Phases 4–6.</p>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-display text-brand-accent mb-4">404</h1>
      <p className="text-brand-muted mb-6">Page not found.</p>
      <a href="/" className="btn-primary">Go home</a>
    </div>
  )
}
