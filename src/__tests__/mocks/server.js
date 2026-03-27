import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW server — starts before all tests, resets handlers between tests,
 * and closes after the suite. Import this in any test file that needs
 * to mock API calls.
 */
export const server = setupServer(...handlers)
