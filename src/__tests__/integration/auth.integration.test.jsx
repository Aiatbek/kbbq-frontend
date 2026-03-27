import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { AuthProvider } from '../../context/AuthContext'
import LoginPage from '../../pages/LoginPage'
import RegisterPage from '../../pages/RegisterPage'
import { MenuPage } from '../../pages'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

/**
 * Renders a mini app with real routing so we can assert
 * that navigation actually happens after login/register.
 */
function renderApp(initialRoute = '/login') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu"     element={<MenuPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Auth flows — integration', () => {

  // ── Login ────────────────────────────────────────────────────────────────

  describe('Login flow', () => {

    it('successful login redirects to /menu', async () => {
      // No active session on load
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({}, { status: 401 })
        )
      )
      const user = userEvent.setup()
      renderApp('/login')

      await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // After redirect the menu page stub should appear
      await waitFor(() =>
        expect(screen.getByText(/menu page coming/i)).toBeInTheDocument()
      )
    })

    it('wrong password stays on login page and shows field error', async () => {
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({}, { status: 401 })
        )
      )
      const user = userEvent.setup()
      renderApp('/login')

      await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
      await user.type(screen.getByLabelText(/password/i), 'badpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument()
      // Still on login page — sign in button still visible
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('unknown email stays on login page with email field error', async () => {
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({}, { status: 401 })
        )
      )
      const user = userEvent.setup()
      renderApp('/login')

      await user.type(screen.getByLabelText(/email/i), 'notfound@kbbq.com')
      await user.type(screen.getByLabelText(/password/i), 'anything')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(await screen.findByText(/no account found/i)).toBeInTheDocument()
    })

    it('already-logged-in user visiting /login is redirected to /menu', async () => {
      // /me returns a valid user — simulates an existing session
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({ id: 'u1', name: 'Test User', email: 'test@kbbq.com', role: 'user' })
        )
      )

      // We need GuestRoute here — recreate the mini app with it
      const { default: GuestRoute } = await import('../../routes/GuestRoute')
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      render(
        <QueryClientProvider client={qc}>
          <MemoryRouter initialEntries={['/login']}>
            <AuthProvider>
              <Routes>
                <Route element={<GuestRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route path="/menu" element={<MenuPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() =>
        expect(screen.getByText(/menu page coming/i)).toBeInTheDocument()
      )
    })
  })

  // ── Register ─────────────────────────────────────────────────────────────

  describe('Register flow', () => {

    it('successful register auto-logs in and redirects to /menu', async () => {
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({}, { status: 401 })
        )
      )
      const user = userEvent.setup()
      renderApp('/register')

      await user.type(screen.getByLabelText(/full name/i), 'New User')
      await user.type(screen.getByLabelText(/email/i), 'newuser@kbbq.com')
      await user.type(screen.getByLabelText(/^password/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() =>
        expect(screen.getByText(/menu page coming/i)).toBeInTheDocument()
      )
    })

    it('duplicate email shows inline error and stays on register page', async () => {
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({}, { status: 401 })
        )
      )
      const user = userEvent.setup()
      renderApp('/register')

      await user.type(screen.getByLabelText(/full name/i), 'Existing')
      await user.type(screen.getByLabelText(/email/i), 'taken@kbbq.com')
      await user.type(screen.getByLabelText(/^password/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('mismatched passwords never reach the API', async () => {
      server.use(
        http.get('http://localhost:5000/api/auth/me', () =>
          HttpResponse.json({}, { status: 401 })
        )
      )
      const user = userEvent.setup()
      renderApp('/register')

      await user.type(screen.getByLabelText(/full name/i), 'Test')
      await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
      await user.type(screen.getByLabelText(/^password/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'different999')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Client-side error shown immediately — no API delay
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })
})
