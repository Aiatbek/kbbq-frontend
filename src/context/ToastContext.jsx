import { createContext, useContext, useState, useCallback } from 'react'

/**
 * ToastContext — global notification system.
 * Any component can call showToast() without managing local state.
 *
 * Usage:
 *   const { showToast } = useToast()
 *   showToast('Order placed!', 'success')
 *   showToast('Something went wrong', 'error')
 *   showToast('Item updated', 'info')
 */
const ToastContext = createContext(null)

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
}

const STYLES = {
  success: 'bg-brand-success/10 border-brand-success/30 text-brand-success',
  error:   'bg-brand-danger/10  border-brand-danger/30  text-brand-danger',
  info:    'bg-brand-accent/10  border-brand-accent/30  text-brand-accent',
  warning: 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((msg, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(toast => toast.id !== id)), duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack — bottom right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, msg, type }) => (
          <div
            key={id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm
                        font-medium shadow-xl pointer-events-auto
                        animate-[slideIn_0.2s_ease-out]
                        ${STYLES[type] ?? STYLES.info}`}
          >
            <span className="text-base leading-none">{ICONS[type]}</span>
            <span>{msg}</span>
            <button
              onClick={() => dismiss(id)}
              className="ml-2 opacity-50 hover:opacity-100 text-xs leading-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
