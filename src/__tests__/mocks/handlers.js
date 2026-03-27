import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:5000'

/**
 * MSW request handlers — intercept Axios calls during tests so we never
 * hit a real server. Each handler mirrors the real backend contract.
 */
export const handlers = [

  // POST /api/auth/login
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const { email, password } = await request.json()

    if (email === 'test@kbbq.com' && password === 'password123') {
      return HttpResponse.json({
        message: 'Login successful',
        user: { id: 'u1', name: 'Test User', email, role: 'user' },
      })
    }
    if (email === 'admin@kkbbq.com' && password === 'Admin123!') {
      return HttpResponse.json({
        message: 'Login successful',
        user: { id: 'u2', name: 'Admin', email, role: 'admin' },
      })
    }
    if (email === 'notfound@kbbq.com') {
      return HttpResponse.json({ message: 'User not found' }, { status: 401 })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  // POST /api/auth/register
  http.post(`${BASE}/api/auth/register`, async ({ request }) => {
    const { email } = await request.json()

    if (email === 'taken@kbbq.com') {
      return HttpResponse.json({ message: 'Email already in use' }, { status: 409 })
    }
    return HttpResponse.json(
      { id: 'u3', name: 'New User', email, role: 'user' },
      { status: 201 }
    )
  }),

  // POST /api/auth/logout
  http.post(`${BASE}/api/auth/logout`, () =>
    HttpResponse.json({ message: 'Logout successful' })
  ),

  // GET /api/auth/me — returns a logged-in user by default
  http.get(`${BASE}/api/auth/me`, () =>
    HttpResponse.json({ id: 'u1', name: 'Test User', email: 'test@kbbq.com', role: 'user' })
  ),
]
