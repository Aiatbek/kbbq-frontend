import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

/**
 * PageTransition — wraps each page's content with a subtle
 * fade-up animation triggered on route change.
 *
 * Usage: wrap the content inside each page component, or
 * place once inside Layout around <Outlet />.
 */
export default function PageTransition({ children }) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  // Re-trigger animation on every route change
  useEffect(() => {
    setVisible(false)
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [location.pathname])

  return (
    <div
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </div>
  )
}
