import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: '' }))
    setApiError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/menu')
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      if (msg.toLowerCase().includes('password')) setErrors({ password: 'Incorrect password' })
      else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('user')) setErrors({ email: 'No account found with this email' })
      else setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-brand-primary mb-2">Welcome back</h1>
          <p className="text-brand-muted text-sm">Sign in to your KBBQ account</p>
        </div>

        <div className="card">
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" autoComplete="email"
                className={`input ${errors.email ? 'border-brand-danger focus:ring-brand-danger/30' : ''}`} />
              {errors.email && <p className="mt-1 text-xs text-brand-danger">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" autoComplete="current-password"
                className={`input ${errors.password ? 'border-brand-danger focus:ring-brand-danger/30' : ''}`} />
              {errors.password && <p className="mt-1 text-xs text-brand-danger">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-brand-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-accent font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
