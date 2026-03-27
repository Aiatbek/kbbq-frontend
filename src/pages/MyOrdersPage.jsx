import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import socket from '../lib/socket'
import api from '../lib/axios'


const fetchMyOrders = () => api.get('/api/orders/my').then(r => r.data)

const STATUS_STYLES = {
  pending:   'bg-brand-warning/10 text-brand-warning  border-brand-warning/30',
  confirmed: 'bg-brand-accent/10  text-brand-accent   border-brand-accent/30',
  preparing: 'bg-purple-400/10    text-purple-400     border-purple-400/30',
  ready:     'bg-brand-success/10 text-brand-success  border-brand-success/30',
  completed: 'bg-brand-muted/10   text-brand-muted    border-brand-border',
  cancelled: 'bg-brand-danger/10  text-brand-danger   border-brand-danger/30',
}

// Visual progress pipeline — maps status to step index
const PIPELINE = ['pending', 'confirmed', 'preparing', 'ready', 'completed']

function StatusPipeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="badge border text-xs bg-brand-danger/10 text-brand-danger border-brand-danger/30">
          Cancelled
        </span>
      </div>
    )
  }
  const current = PIPELINE.indexOf(status)
  return (
    <div className="flex items-center gap-1">
      {PIPELINE.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`h-1.5 rounded-full transition-all duration-300
                          ${i <= current ? 'bg-brand-accent w-6' : 'bg-brand-border w-4'}`} />
        </div>
      ))}
      <span className={`ml-2 badge border text-xs ${STATUS_STYLES[status]}`}>{status}</span>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}


export default function MyOrdersPage() {
  const qc = useQueryClient()
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['myOrders'],
    queryFn: fetchMyOrders,
  })

  useEffect(() => {
  const refresh = () => qc.invalidateQueries(['myOrders'])
  socket.on('orderStatusUpdated', refresh)
  return () => socket.off('orderStatusUpdated', refresh)
}, [qc])

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-brand-surface border border-brand-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-brand-danger text-sm">Failed to load orders.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-brand-primary">My Orders</h1>
          <p className="text-brand-muted text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/menu" className="btn-primary text-sm">+ New order</Link>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4 opacity-30">🍽️</p>
          <p className="text-brand-muted text-sm mb-5">You haven't placed any orders yet.</p>
          <Link to="/menu" className="btn-primary">Browse menu</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card space-y-4">

              {/* Order header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-brand-muted mb-1">{order._id}</p>
                  <p className="text-xs text-brand-muted">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-mono text-brand-accent">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-brand-muted capitalize">{order.type}</p>
                </div>
              </div>

              {/* Status pipeline */}
              <StatusPipeline status={order.status} />

              {/* Line items */}
              <div className="pt-3 border-t border-brand-border space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-muted font-mono text-xs w-5">{item.quantity}×</span>
                      <span className="text-brand-primary">
                        {item.menuItemId?.name ?? 'Item'}
                      </span>
                    </div>
                    <span className="font-mono text-brand-muted text-xs">
                      ${(item.priceAtOrderTime * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
