import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import socket from '../lib/socket'
import { useToast } from '../context/ToastContext'
import api from '../lib/axios'

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchReservations      = ()            => api.get('/api/reservations').then(r => r.data)
const updateStatus           = ({ id, status }) => api.patch(`/api/reservations/${id}/status`, { status })
const deleteReservation      = (id)          => api.delete(`/api/reservations/${id}`)

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:   'bg-brand-warning/10 text-brand-warning  border-brand-warning/30',
  confirmed: 'bg-brand-accent/10  text-brand-accent   border-brand-accent/30',
  cancelled: 'bg-brand-danger/10  text-brand-danger   border-brand-danger/30',
}

const STATUSES = ['pending', 'confirmed', 'cancelled']

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatCreated(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminReservationsPage() {
  const qc = useQueryClient()

  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch]             = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedId, setExpandedId]     = useState(null)
  const { showToast } = useToast()// row expanded for details

    useEffect(() => {
    const refresh = () => qc.invalidateQueries(['adminReservations'])
    socket.on('newReservation', refresh)
    socket.on('reservationStatusUpdated', refresh)
    return () => {
      socket.off('newReservation', refresh)
      socket.off('reservationStatusUpdated', refresh)
    }
  }, [qc])

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['adminReservations'],
    queryFn: fetchReservations,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: changeStatus, isPending: changingStatus } = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => { qc.invalidateQueries(['adminReservations']); showToast('Status updated!') },
    onError:   () => showToast('Failed to update status.', 'error'),
  })

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      qc.invalidateQueries(['adminReservations'])
      showToast('Reservation deleted.')
      setDeleteConfirm(null)
    },
    onError: () => showToast('Failed to delete.', 'error'),
  })

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = reservations
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q)
      )
    })

  // KPI counts
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = reservations.filter(r => r.status === s).length
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-brand-primary">Reservations</h1>
          <p className="text-brand-muted text-sm mt-1">
            {reservations.length} total · real-time
          </p>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total',     value: reservations.length, color: 'text-brand-primary' },
          { label: 'Pending',   value: counts.pending,       color: 'text-brand-warning' },
          { label: 'Confirmed', value: counts.confirmed,     color: 'text-brand-accent' },
          { label: 'Cancelled', value: counts.cancelled,     color: 'text-brand-danger' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card flex flex-col gap-1">
            <p className="text-xs text-brand-muted uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">🔍</span>
          <input
            type="text" placeholder="Search by name, email or phone…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-brand-surface border border-brand-border rounded-xl p-1">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                          ${filterStatus === s
                            ? 'bg-brand-accent text-brand-bg shadow'
                            : 'text-brand-muted hover:text-brand-primary'}`}>
              {s === 'all' ? `All (${reservations.length})` : `${s} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-brand-elevated animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-brand-muted">
            <p className="text-4xl mb-3 opacity-30">📅</p>
            <p className="text-sm">No reservations match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Booked at</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <>
                    <tr key={r._id}
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}>

                      {/* Guest info */}
                      <td>
                        <p className="font-medium text-brand-primary">{r.name}</p>
                        <p className="text-xs text-brand-muted">{r.email}</p>
                      </td>

                      {/* Date + time */}
                      <td>
                        <p className="text-brand-primary">{formatDate(r.date)}</p>
                        <p className="text-xs text-brand-muted font-mono">{r.time}</p>
                      </td>

                      {/* Party size */}
                      <td className="font-mono text-brand-muted">{r.numberOfGuests}</td>

                      {/* Status dropdown */}
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          value={r.status}
                          disabled={changingStatus}
                          onChange={e => changeStatus({ id: r._id, status: e.target.value })}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border bg-transparent
                                      cursor-pointer outline-none transition-colors
                                      ${STATUS_STYLES[r.status]}`}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}
                              className="bg-brand-elevated text-brand-primary">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Created at */}
                      <td className="text-xs text-brand-muted font-mono">
                        {formatCreated(r.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteConfirm(r._id)}
                          className="text-xs text-brand-muted hover:text-brand-danger transition-colors px-2 py-1">
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Expanded row — shows phone + special requests */}
                    {expandedId === r._id && (
                      <tr key={`${r._id}-expanded`} className="bg-brand-elevated/40">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex flex-wrap gap-6 text-sm">
                            <div>
                              <p className="text-xs text-brand-muted uppercase tracking-wider mb-0.5">Phone</p>
                              <p className="text-brand-primary font-mono">{r.phone}</p>
                            </div>
                            {r.specialRequests && (
                              <div>
                                <p className="text-xs text-brand-muted uppercase tracking-wider mb-0.5">Special requests</p>
                                <p className="text-brand-primary">{r.specialRequests}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-brand-muted uppercase tracking-wider mb-0.5">Reservation ID</p>
                              <p className="text-brand-muted font-mono text-xs">{r._id}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete confirm modal ──────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="card-elevated max-w-sm w-full border border-brand-danger/30"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg text-brand-primary mb-2">Delete reservation?</h3>
            <p className="text-brand-muted text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => remove(deleteConfirm)} disabled={removing} className="btn-danger flex-1">
                {removing ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
