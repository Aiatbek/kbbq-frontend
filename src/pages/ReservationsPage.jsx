import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import socket from '../lib/socket'
import api from '../lib/axios'

const createReservation = (data) => api.post('/api/reservations', data).then(r => r.data)
const fetchMyReservations = () =>
  api.get('/api/reservations/my').then(r => r.data).catch(() => [])

const STATUS = {
  pending:   'bg-brand-warning/10 text-brand-warning  border-brand-warning/30',
  confirmed: 'bg-brand-accent/10  text-brand-accent   border-brand-accent/30',
  cancelled: 'bg-brand-danger/10  text-brand-danger   border-brand-danger/30',
}

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '5:00 PM',  '5:30 PM',  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM',  '8:30 PM'
]

const emptyForm = {
  name: '', email: '', phone: '',
  date: '', time: '', numberOfGuests: '', specialRequests: '',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const [form, setForm]           = useState({ ...emptyForm, name: user?.name || '', email: user?.email || '' })
  const [errors, setErrors]       = useState({})
  const [view, setView]           = useState('form')
  const [confirmed, setConfirmed] = useState(null)

  const { data: myReservations = [] } = useQuery({
    queryKey: ['myReservations'],
    queryFn: fetchMyReservations,
    enabled: !!user,
  })

  useEffect(() => {
  const refresh = () => qc.invalidateQueries(['myReservations'])
  socket.on('reservationStatusUpdated', refresh)
  return () => socket.off('reservationStatusUpdated', refresh)
}, [qc])

  const { mutate: submit, isPending } = useMutation({
    mutationFn: createReservation,
    onSuccess: (data) => {
      setConfirmed(data)
      setView('success')
      qc.invalidateQueries(['myReservations'])
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Something went wrong'
      setErrors({ api: msg })
    },
  })

  const set = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (!form.date)         errs.date  = 'Please choose a date'
    else if (form.date < getTodayStr()) errs.date = 'Date cannot be in the past'
    if (!form.time)         errs.time  = 'Please choose a time slot'
    if (!form.numberOfGuests || Number(form.numberOfGuests) < 1)
      errs.numberOfGuests = 'At least 1 guest required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    submit({ ...form, numberOfGuests: Number(form.numberOfGuests) })
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (view === 'success' && confirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="card border-brand-success/30 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-success/10 border border-brand-success/30
                          flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
          <h1 className="text-2xl text-brand-primary mb-1">Reservation confirmed!</h1>
          <p className="text-brand-muted text-sm mb-6">We'll see you soon. A summary is shown below.</p>

          <div className="bg-brand-elevated rounded-xl border border-brand-border p-5 text-left space-y-3 mb-6">
            {[
              { label: 'Name',   value: confirmed.name },
              { label: 'Date',   value: formatDate(confirmed.date) },
              { label: 'Time',   value: confirmed.time },
              { label: 'Guests', value: confirmed.numberOfGuests },
              { label: 'Phone',  value: confirmed.phone },
              { label: 'Email',  value: confirmed.email },
              ...(confirmed.specialRequests ? [{ label: 'Special requests', value: confirmed.specialRequests }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <span className="text-brand-muted shrink-0">{label}</span>
                <span className="text-brand-primary text-right">{String(value)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-brand-border flex justify-between text-sm">
              <span className="text-brand-muted">Status</span>
              <span className={`badge border text-xs ${STATUS[confirmed.status] ?? ''}`}>{confirmed.status}</span>
            </div>
          </div>

          <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-4 text-left mb-6">
            <p className="text-xs text-brand-accent font-medium uppercase tracking-wider mb-1">📧 Confirmation email</p>
            <p className="text-xs text-brand-muted leading-relaxed">
              A confirmation has been sent to{' '}
              <span className="text-brand-primary">{confirmed.email}</span>. Please check your inbox (and spam folder).
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setForm({ ...emptyForm, name: user?.name || '', email: user?.email || '' }); setView('form') }}
              className="btn-outline flex-1">
              Book another table
            </button>
            <button onClick={() => setView('history')} className="btn-primary flex-1">
              View my reservations
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── HISTORY VIEW ──────────────────────────────────────────────────────────
  if (view === 'history') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-brand-primary">My Reservations</h1>
            <p className="text-brand-muted text-sm mt-1">{myReservations.length} booking{myReservations.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setView('form')} className="btn-primary text-sm">+ New reservation</button>
        </div>

        {myReservations.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-3 opacity-30">📅</p>
            <p className="text-brand-muted text-sm mb-4">No reservations yet.</p>
            <button onClick={() => setView('form')} className="btn-primary">Book a table</button>
          </div>
        ) : (
          <div className="space-y-3">
            {myReservations.map((r) => (
              <div key={r._id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="shrink-0 w-16 h-16 bg-brand-elevated border border-brand-border
                                rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs text-brand-muted uppercase tracking-wider">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-mono text-brand-accent leading-none">
                    {new Date(r.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-brand-primary">{r.time}</span>
                    <span className="text-brand-muted text-xs">·</span>
                    <span className="text-xs text-brand-muted">{r.numberOfGuests} guest{r.numberOfGuests !== 1 ? 's' : ''}</span>
                    {r.specialRequests && (
                      <>
                        <span className="text-brand-muted text-xs">·</span>
                        <span className="text-xs text-brand-muted truncate max-w-xs">{r.specialRequests}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted">{formatDate(r.date)}</p>
                </div>
                <span className={`badge border text-xs shrink-0 ${STATUS[r.status] ?? ''}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── BOOKING FORM ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-brand-primary">Book a Table</h1>
          <p className="text-brand-muted text-sm mt-1">Reserve your spot at KBBQ</p>
        </div>
        {myReservations.length > 0 && (
          <button onClick={() => setView('history')} className="text-xs text-brand-accent hover:underline">
            View my bookings ({myReservations.length})
          </button>
        )}
      </div>

      <div className="card">
        {errors.api && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Row 1 — Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
                Full name<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <input type="text" name="name" value={form.name} onChange={set}
                placeholder="Your name"
                className={`input ${errors.name ? 'border-brand-danger' : ''}`} />
              {errors.name && <p className="mt-1 text-xs text-brand-danger">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
                Email<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={set}
                placeholder="you@example.com"
                className={`input ${errors.email ? 'border-brand-danger' : ''}`} />
              {errors.email && <p className="mt-1 text-xs text-brand-danger">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2 — Phone + Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
                Phone<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <input type="tel" name="phone" value={form.phone} onChange={set}
                placeholder="+1 (555) 000-0000"
                className={`input ${errors.phone ? 'border-brand-danger' : ''}`} />
              {errors.phone && <p className="mt-1 text-xs text-brand-danger">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
                Number of guests<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <input type="number" name="numberOfGuests" value={form.numberOfGuests} onChange={set}
                placeholder="2" min="1"
                className={`input ${errors.numberOfGuests ? 'border-brand-danger' : ''}`} />
              {errors.numberOfGuests && <p className="mt-1 text-xs text-brand-danger">{errors.numberOfGuests}</p>}
            </div>
          </div>

          {/* Row 3 — Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
                Date<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <input type="date" name="date" value={form.date} onChange={set}
                min={getTodayStr()}
                className={`input ${errors.date ? 'border-brand-danger' : ''}`} />
              {errors.date && <p className="mt-1 text-xs text-brand-danger">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
                Time<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <select name="time" value={form.time} onChange={set}
                className={`input ${errors.time ? 'border-brand-danger' : ''}`}>
                <option value="">Select a time slot</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.time && <p className="mt-1 text-xs text-brand-danger">{errors.time}</p>}
            </div>
          </div>

          {/* Special requests */}
          <div>
            <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
              Special requests <span className="normal-case text-brand-faint">(optional)</span>
            </label>
            <textarea name="specialRequests" value={form.specialRequests} onChange={set}
              rows={3} placeholder="Dietary requirements, celebrations, seating preferences…"
              className="input resize-none" />
          </div>

          {/* Summary strip */}
          {form.date && form.time && form.numberOfGuests && (
            <div className="flex items-center gap-3 bg-brand-elevated border border-brand-accent/20
                            rounded-xl px-4 py-3 text-sm">
              <span className="text-brand-accent text-lg">📅</span>
              <p className="text-brand-muted">
                <span className="text-brand-primary font-medium">
                  {form.numberOfGuests} guest{Number(form.numberOfGuests) !== 1 ? 's' : ''}
                </span>{' '}on{' '}
                <span className="text-brand-primary font-medium">{formatDate(form.date)}</span>
                {' '}at{' '}
                <span className="text-brand-primary font-medium">{form.time}</span>
              </p>
            </div>
          )}

          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? 'Reserving…' : 'Confirm reservation'}
          </button>
        </form>
      </div>
    </div>
  )
}