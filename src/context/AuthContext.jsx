import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'

/**
 * AuthContext — session-based auth state and helpers.
 *
 * Shape:
 *   user      — user object { id, name, email, role } or null
 *   loading   — true while the /me check is in flight on first load
 *   login     — async fn(email, password) → sets user from response body
 *   logout    — async fn() → calls /api/auth/logout, clears user state
 *   isAdmin   — convenience boolean
 *
 * How session auth works here:
 *   1. Login → backend sets HttpOnly cookie automatically via Set-Cookie header
 *   2. Every Axios request sends that cookie because withCredentials: true
 *   3. On page refresh, we call GET /api/auth/me — if the session cookie is
 *      still valid the backend returns the user; otherwise 401 → user = null
 *   4. Logout → backend destroys the session and clears the cookie
 *
 * No token, no localStorage — the cookie does everything.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // loading stays true until the /me call resolves so PrivateRoute doesn't
  // flash a redirect before we know if the session is valid
  const [loading, setLoading] = useState(true)

  /**
   * On mount — check if there's an active session on the backend.
   * This is what keeps the user logged in across page refreshes.
   */
  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))   // 401 = no session, that's fine
      .finally(() => setLoading(false))
  }, [])

  /** POST /api/auth/login — user object comes back in the response body */
  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    // Backend returns { message, user: { id, name, email, role } }
    setUser(res.data.user)
    return res
  }, [])

  /** POST /api/auth/logout — backend destroys session + clears cookie */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Clear local state even if the API call fails
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/** Custom hook — throws if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
