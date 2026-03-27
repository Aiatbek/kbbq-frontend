import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/axios'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
 const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.confirm) errs.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      await api.post('/api/auth/register', { name: form.name, email: form.email, phone: form.phone, password: form.password })
      await login(form.email, form.password)
      navigate('/menu')
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('use')) setErrors({ email: 'An account with this email already exists' })
      else setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-brand-primary mb-2">Create account</h1>
          <p className="text-brand-muted text-sm">Join KBBQ and start ordering</p>
        </div>

        <div className="card">
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {[
              { label: 'Full name',        name: 'name',     type: 'text',     placeholder: 'Your name',       autoComplete: 'name' },
              { label: 'Email',            name: 'email',    type: 'email',    placeholder: 'you@example.com', autoComplete: 'email' },
               { label: 'Phone',            name: 'phone',    type: 'tel',      placeholder: '+1 (000) 000-0000', autoComplete: 'tel' },
              { label: 'Password',         name: 'password', type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
              { label: 'Confirm password', name: 'confirm',  type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
            ].map(({ label, name, type, placeholder, autoComplete }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-brand-muted mb-1">{label}</label>
                <input type={type} name={name} value={form[name]} onChange={handleChange}
                  placeholder={placeholder} autoComplete={autoComplete}
                  className={`input ${errors[name] ? 'border-brand-danger focus:ring-brand-danger/30' : ''}`} />
                {errors[name] && <p className="mt-1 text-xs text-brand-danger">{errors[name]}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-brand-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-accent font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
