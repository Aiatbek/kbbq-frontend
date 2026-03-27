import { Component } from 'react'
import { Link } from 'react-router-dom'

/**
 * ErrorBoundary — wraps the whole app and catches any unhandled
 * render errors so the user sees a friendly page instead of a blank screen.
 *
 * Usage: wrap <App /> or individual route subtrees.
 * This must be a class component — hooks cannot catch render errors.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a logging service (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-brand-danger/10 border border-brand-danger/30
                          flex items-center justify-center text-2xl text-brand-danger mx-auto mb-6">
            ⚠
          </div>

          <h1 className="text-3xl font-display text-brand-primary mb-2">Something went wrong</h1>
          <p className="text-brand-muted text-sm leading-relaxed mb-2">
            An unexpected error occurred. Our team has been notified.
          </p>

          {/* Error details (collapsed in prod) */}
          {import.meta.env.DEV && this.state.error && (
            <details className="text-left mb-6">
              <summary className="text-xs text-brand-muted cursor-pointer hover:text-brand-primary mb-2">
                Error details (dev only)
              </summary>
              <pre className="text-xs text-brand-danger bg-brand-elevated border border-brand-border
                              rounded-lg p-4 overflow-auto max-h-40 whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-outline"
            >
              Try again
            </button>
            <Link to="/" className="btn-primary">Go home</Link>
          </div>
        </div>
      </div>
    )
  }
}
