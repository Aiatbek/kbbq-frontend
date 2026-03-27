import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '../helpers'
import LoginPage from '../../pages/LoginPage'

// Point /me to 401 so tests start as a guest
beforeAll(() => {
  server.listen()
  server.use(
    http.get('http://localhost:5000/api/auth/me', () =>
      HttpResponse.json({}, { status: 401 })
    )
  )
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('LoginPage — unit', () => {

  it('renders all form fields and the submit button', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows inline error when email is empty on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows inline error when password is empty on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'notanemail')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('shows "No account found" error when backend returns User not found', async () => {
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({}, { status: 401 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'notfound@kbbq.com')
    await user.type(screen.getByLabelText(/password/i), 'anything')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/no account found/i)).toBeInTheDocument()
  })

  it('shows "Incorrect password" error when backend returns Invalid credentials', async () => {
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({}, { status: 401 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument()
  })

  it('clears field error when the user starts typing again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    // Trigger email error
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()

    // Start typing — error should disappear
    await user.type(screen.getByLabelText(/email/i), 'a')
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
  })

  it('disables the submit button while the request is in flight', async () => {
    // Use a delayed response so we can assert the loading state
    server.use(
      http.post('http://localhost:5000/api/auth/login', async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({
          message: 'Login successful',
          user: { id: 'u1', name: 'Test User', email: 'test@kbbq.com', role: 'user' },
        })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Button text changes and becomes disabled while loading
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
