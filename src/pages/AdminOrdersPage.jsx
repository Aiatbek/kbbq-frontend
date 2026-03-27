import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import socket from '../lib/socket'
import { useNotification } from '../context/NotificationContext'
import { useToast } from '../context/ToastContext'
import api from '../lib/axios'

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchOrders  = ()               => api.get('/api/orders/my').then(r => r.data)
  // Note: admin uses /api/orders/stats + status patch. For a full admin order
  // list you'd add GET /api/orders on the backend (see backend note below).
  // For now we fetch stats and let status updates work via the patch endpoint.
const fetchAllOrders = ()             => api.get('/api/orders/admin').then(r => r.data).catch(() => [])
const fetchStats   = ()               => api.get('/api/orders/stats').then(r => r.data)
const patchStatus  = ({ id, status }) => api.patch(`/api/orders/${id}/status`, { status })

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

const NEXT_STATUS = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'completed',
}

const STATUS_STYLES = {
  pending:   'bg-brand-warning/10 text-brand-warning  border-brand-warning/30',
  confirmed: 'bg-brand-accent/10  text-brand-accent   border-brand-accent/30',
  preparing: 'bg-purple-400/10    text-purple-400     border-purple-400/30',
  ready:     'bg-brand-success/10 text-brand-success  border-brand-success/30',
  completed: 'bg-brand-muted/10   text-brand-muted    border-brand-border',
  cancelled: 'bg-brand-danger/10  text-brand-danger   border-brand-danger/30',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  }) + ' · ' + new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('all')
  const { showToast } = useToast()
  const { clearUnseenOrders } = useNotification()

useEffect(() => { clearUnseenOrders() }, [clearUnseenOrders])

useEffect(() => {
  const refresh = () => {
    qc.invalidateQueries(['adminOrders'])
    qc.invalidateQueries(['orderStats'])
  }
  socket.on('newOrder', refresh)
  socket.on('orderStatusUpdated', refresh)
  return () => {
    socket.off('newOrder', refresh)
    socket.off('orderStatusUpdated', refresh)
  }
}, [qc])

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchAllOrders,
  })

  const { data: stats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: fetchStats,
  })

  // ── Mutation ──────────────────────────────────────────────────────────────
  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: patchStatus,
    onSuccess: () => {
      qc.invalidateQueries(['adminOrders'])
      qc.invalidateQueries(['orderStats'])
      showToast('Status updated!')
    },
    onError: () => showToast('Failed to update status.', 'error'),
  })

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})

  // Active orders = not completed / not cancelled
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-brand-primary">Order Queue</h1>
          <p className="text-brand-muted text-sm mt-1">
            {activeOrders.length} active · real-time
          </p>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="card flex flex-col gap-1">
          <p className="text-xs text-brand-muted uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-mono text-brand-primary">{stats?.totalOrders ?? '—'}</p>
        </div>
        <div className="card flex flex-col gap-1">
          <p className="text-xs text-brand-muted uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-mono text-brand-accent">
            ${stats?.totalRevenue?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div className="card flex flex-col gap-1">
          <p className="text-xs text-brand-muted uppercase tracking-wider">Active</p>
          <p className="text-2xl font-mono text-brand-warning">{activeOrders.length}</p>
        </div>
        <div className="card flex flex-col gap-1">
          <p className="text-xs text-brand-muted uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-mono text-brand-success">{counts.completed}</p>
        </div>
      </div>

      {/* ── Active orders — kanban-style quick view ───────────────────────── */}
      {activeOrders.length > 0 && filterStatus === 'all' && (
        <div className="mb-8">
          <p className="text-xs text-brand-muted uppercase tracking-wider mb-3">Active orders</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeOrders.map(order => (
              <div key={order._id}
                className={`rounded-xl border p-4 space-y-3 ${STATUS_STYLES[order.status]}`}>

                {/* Order ID + time */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono opacity-70 truncate">{order._id.slice(-8)}</p>
                  <p className="text-xs opacity-70">{formatDate(order.createdAt)}</p>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm">
                      <span className="font-mono opacity-70">{item.quantity}×</span>{' '}
                      {item.menuItemId?.name ?? 'Item'}
                    </p>
                  ))}
                </div>

                {/* Total + advance button */}
                <div className="flex items-center justify-between pt-2 border-t border-current/20">
                  <span className="font-mono text-sm">${order.totalPrice.toFixed(2)}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      disabled={updating}
                      onClick={() => updateStatus({ id: order._id, status: NEXT_STATUS[order.status] })}
                      className="text-xs font-medium px-3 py-1 rounded-lg bg-white/10
                                 hover:bg-white/20 border border-current/30 transition-colors">
                      → {NEXT_STATUS[order.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full order table ──────────────────────────────────────────────── */}
      <div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-brand-surface border border-brand-border rounded-xl p-1 mb-5 flex-wrap">
          <button onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${filterStatus === 'all'
                          ? 'bg-brand-accent text-brand-bg shadow'
                          : 'text-brand-muted hover:text-brand-primary'}`}>
            All ({orders.length})
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                          ${filterStatus === s
                            ? 'bg-brand-accent text-brand-bg shadow'
                            : 'text-brand-muted hover:text-brand-primary'}`}>
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-brand-elevated animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-brand-muted">
              <p className="text-4xl mb-3 opacity-30">📋</p>
              <p className="text-sm">No orders with this status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th className="text-right">Advance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order._id}>
                      <td>
                        <p className="text-sm font-medium text-brand-primary">{order.userId?.name ?? '—'}</p>
                        <p className="text-xs text-brand-muted">{order.userId?.phone ?? order.userId?.email ?? '—'}</p>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-xs text-brand-muted">
                              <span className="font-mono">{item.quantity}×</span>{' '}
                              <span className="text-brand-primary">{item.menuItemId?.name ?? 'Item'}</span>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="font-mono text-brand-accent">${order.totalPrice.toFixed(2)}</td>
                      <td className="capitalize text-brand-muted text-xs">{order.type}</td>
                      <td>
                        {/* Inline status dropdown */}
                        <select
                          value={order.status}
                          disabled={updating}
                          onChange={e => updateStatus({ id: order._id, status: e.target.value })}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border bg-transparent
                                      cursor-pointer outline-none ${STATUS_STYLES[order.status]}`}>
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-brand-elevated text-brand-primary capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-xs font-mono text-brand-muted">{formatDate(order.createdAt)}</td>
                      <td className="text-right">
                        {NEXT_STATUS[order.status] ? (
                          <button
                            disabled={updating}
                            onClick={() => updateStatus({ id: order._id, status: NEXT_STATUS[order.status] })}
                            className="text-xs text-brand-accent hover:underline disabled:opacity-50">
                            → {NEXT_STATUS[order.status]}
                          </button>
                        ) : (
                          <span className="text-xs text-brand-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
