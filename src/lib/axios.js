import axios from 'axios'

/**
 * Pre-configured Axios instance for session-based auth.
 *
 * Key setting: withCredentials: true
 * This tells the browser to include the session cookie (itsSessionCookie)
 * on every request — without this, the backend never sees the session
 * and all protected routes return 401.
 *
 * No Authorization header needed — the cookie handles identity automatically.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send session cookie on every request
})

// Global response error handler — log 401s for easy debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or not authenticated.')
    }
    return Promise.reject(error)
  }
)

export default api
