import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../context/AuthContext'

/**
 * renderWithProviders — wraps a component with every provider the app uses.
 *
 * @param {JSX.Element} ui          — component to render
 * @param {object}      options
 * @param {string}      options.initialRoute — starting URL (default '/')
 *
 * Returns everything from RTL's render() so you can destructure
 * { getByText, getByRole, ... } as usual.
 */
export function renderWithProviders(ui, { initialRoute = '/' } = {}) {
  // Fresh QueryClient per test — prevents cache leaking between tests
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}
