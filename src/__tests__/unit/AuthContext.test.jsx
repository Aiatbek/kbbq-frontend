import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Start MSW before all tests in this file
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Wrapper that supplies every required provider to renderHook
const wrapper = ({ children }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('AuthContext — unit', () => {

  it('starts with loading=true then resolves user from /me', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Initially loading
    expect(result.current.loading).toBe(true)

    // After /me resolves (MSW returns a user by default)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toMatchObject({ email: 'test@kbbq.com', role: 'user' })
  })

  it('sets user=null when /me returns 401 (no active session)', async () => {
    // Override the default /me handler to return 401
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({ message: 'Not authenticated' }, { status: 401 })
      )
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('login() sets user in context on success', async () => {
    // Start with no session
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({}, { status: 401 })
      )
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()

    await act(async () => {
      await result.current.login('test@kbbq.com', 'password123')
    })

    expect(result.current.user).toMatchObject({ email: 'test@kbbq.com', role: 'user' })
  })

  it('login() throws on bad credentials', async () => {
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({}, { status: 401 })
      )
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.login('test@kbbq.com', 'wrongpassword')
      })
    ).rejects.toThrow()

    expect(result.current.user).toBeNull()
  })

  it('logout() clears the user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).not.toBeNull())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })

  it('isAdmin is true for admin role', async () => {
    server.use(
      http.get('http://localhost:5000/api/auth/me', () =>
        HttpResponse.json({ id: 'u2', name: 'Admin', email: 'admin@kkbbq.com', role: 'admin' })
      )
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(true)
  })

  it('isAdmin is false for regular user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
  })
})
