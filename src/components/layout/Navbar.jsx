import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'


export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { unseenOrders, unseenReservations  } = useNotification()
  

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-primary'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
     ${isActive
       ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
       : 'text-brand-muted hover:text-brand-primary hover:bg-brand-elevated'}`

  const adminLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-yellow-300' : 'text-brand-warning hover:text-yellow-300'
    }`

  const mobileAdminLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
     ${isActive
       ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20'
       : 'text-brand-warning hover:bg-brand-warning/5'}`

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="font-display text-2xl text-brand-accent tracking-tight drop-shadow-sm">
            🔥 KBBQ
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/menu" className={linkClass}>Menu</NavLink>
            {user && !isAdmin && <>
              <NavLink to="/reservations" className={linkClass}>Reservations</NavLink>
              <NavLink to="/orders" className={linkClass}>My Orders</NavLink>
            </>}
            {isAdmin && <>
              <NavLink to="/admin" className={adminLinkClass}>Menu Mgmt</NavLink>
             <NavLink to="/admin/reservations" className={adminLinkClass}>
                <span className="relative">
                  Bookings
                  {unseenReservations > 0 && (
                    <span className="absolute -top-2 -right-4 bg-brand-danger text-white text-xs
                                    font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unseenReservations > 9 ? '9+' : unseenReservations}
                    </span>
                  )}
                </span>
              </NavLink>
              <NavLink to="/admin/orders" className={adminLinkClass}>
                <span className="relative">
                  Orders
                  {unseenOrders > 0 && (
                    <span className="absolute -top-2 -right-4 bg-brand-danger text-white text-xs
                                    font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unseenOrders > 9 ? '9+' : unseenOrders}
                    </span>
                  )}
                </span>
              </NavLink>
            </>}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link to="/checkout" className="relative p-2 text-brand-muted hover:text-brand-accent transition-colors">
                <span className="text-lg">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-accent text-brand-bg text-xs
                                   font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-brand-muted border border-brand-border px-2.5 py-1 rounded-full">
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn-outline py-1.5 px-4 text-xs">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login"    className="btn-outline py-1.5 px-4 text-xs">Login</Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-xs">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile right — cart + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Link to="/checkout" className="relative p-2 text-brand-muted">
                <span className="text-lg">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-accent text-brand-bg text-xs
                                   font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button
              className="p-2 text-brand-muted hover:text-brand-primary transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {/* Animated hamburger → X */}
              <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                <span className={`block h-0.5 bg-current rounded transition-all duration-200
                                  ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-current rounded transition-all duration-200
                                  ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current rounded transition-all duration-200
                                  ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile drawer panel */}
      <div className={`fixed top-14 right-0 bottom-0 z-50 w-72 bg-brand-surface border-l
                       border-brand-border flex flex-col transition-transform duration-300
                       md:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* User info strip */}
        {user && (
          <div className="px-4 py-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-accent/10 border border-brand-accent/20
                              flex items-center justify-center text-brand-accent font-medium text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-brand-primary">{user.name}</p>
                <p className="text-xs text-brand-muted">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavLink to="/menu" className={mobileLinkClass}>
            <span>🍖</span> Menu
          </NavLink>

          {user && !isAdmin && <>
          <NavLink to="/reservations" className={mobileLinkClass}>
            <span>📅</span> Reservations
          </NavLink>
          <NavLink to="/orders" className={mobileLinkClass}>
            <span>📋</span> My Orders
          </NavLink>
          <NavLink to="/checkout" className={mobileLinkClass}>
              <span>🛒</span>
              Cart
              {totalItems > 0 && (
                <span className="ml-auto bg-brand-accent text-brand-bg text-xs font-bold
                                 w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </>}

          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-brand-border space-y-1">
              <p className="text-xs text-brand-muted uppercase tracking-wider px-4 mb-2">Admin</p>
              <NavLink to="/admin" className={mobileAdminLinkClass}>
                <span>⚙️</span> Menu Management
              </NavLink>
              <NavLink to="/admin/reservations" className={mobileAdminLinkClass}>
                <span>📅</span> Bookings
              </NavLink>
              <NavLink to="/admin/orders" className={mobileAdminLinkClass}>
                <span>📦</span> Order Queue
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer auth */}
        <div className="px-3 py-4 border-t border-brand-border">
          {user ? (
            <button onClick={handleLogout} className="btn-outline w-full text-sm">
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login"    className="btn-outline flex-1 text-center text-sm">Login</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
