import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '../helpers'
import RegisterPage from '../../pages/RegisterPage'

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

describe('RegisterPage — unit', () => {

  it('renders all four fields and the submit button', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows "Name is required" when name is empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })

  it('shows error when password is shorter than 6 characters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test')
    await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
    await user.type(screen.getByLabelText(/^password/i), 'abc')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test')
    await user.type(screen.getByLabelText(/email/i), 'test@kbbq.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('shows inline email error when email is already taken', async () => {
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({}, { status: 401 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test')
    await user.type(screen.getByLabelText(/email/i), 'taken@kbbq.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
  })

  it('disables the button and shows loading text while submitting', async () => {
    server.use(
      http.post('http://localhost:5000/api/auth/register', async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({ id: 'u3', name: 'New', email: 'new@kbbq.com', role: 'user' }, { status: 201 })
      }),
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({}, { status: 401 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'New User')
    await user.type(screen.getByLabelText(/email/i), 'new@kbbq.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })
})
