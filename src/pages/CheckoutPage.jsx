import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../lib/axios'
import { isRestaurantOpen } from '../lib/isOpen'

const placeOrder = (data) => api.post('/api/orders', data).then(r => r.data)

const STATUS_STYLES = {
  pending:   'bg-brand-warning/10 text-brand-warning  border-brand-warning/30',
  confirmed: 'bg-brand-accent/10  text-brand-accent   border-brand-accent/30',
  preparing: 'bg-purple-400/10    text-purple-400     border-purple-400/30',
  ready:     'bg-brand-success/10 text-brand-success  border-brand-success/30',
  completed: 'bg-brand-muted/10   text-brand-muted    border-brand-border',
  cancelled: 'bg-brand-danger/10  text-brand-danger   border-brand-danger/30',
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [confirmed, setConfirmed] = useState(null)

  const { mutate: submitOrder, isPending, error } = useMutation({
    mutationFn: placeOrder,
    onSuccess: (data) => {
      setConfirmed(data)
      clearCart()
    },
  })

  const handlePlaceOrder = () => {
    const orderItems = items.map(({ menuItem, quantity }) => ({
      menuItemId: menuItem._id,
      quantity,
    }))
    submitOrder({ items: orderItems, type: 'pickup' })
  }

  // ── Empty cart guard ────────────────────────────────────────────────────
  if (totalItems === 0 && !confirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4 opacity-30">🛒</p>
        <h1 className="text-2xl text-brand-primary mb-2">Your cart is empty</h1>
        <p className="text-brand-muted text-sm mb-6">Add some items from the menu first.</p>
        <Link to="/menu" className="btn-primary">Browse menu</Link>
      </div>
    )
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="card border-brand-success/30 text-center">
          {/* Check icon */}
          <div className="w-14 h-14 rounded-full bg-brand-success/10 border border-brand-success/30
                          flex items-center justify-center text-2xl mx-auto mb-4 text-brand-success">
            ✓
          </div>
          <h1 className="text-2xl text-brand-primary mb-1">Order placed!</h1>
          <p className="text-brand-muted text-sm mb-6">
            Your order is being prepared. Come pick it up soon.
          </p>

          {/* Order summary */}
          <div className="bg-brand-elevated rounded-xl border border-brand-border p-5 text-left mb-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-brand-muted uppercase tracking-wider">Order ID</p>
              <p className="text-xs font-mono text-brand-muted">{confirmed._id}</p>
            </div>

            {/* Line items */}
            <div className="space-y-2 mb-4">
              {confirmed.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">
                    {item.quantity} ×{' '}
                    <span className="text-brand-primary">
                      {item.menuItemId?.name ?? 'Item'}
                    </span>
                  </span>
                  <span className="font-mono text-brand-accent">
                    ${(item.priceAtOrderTime * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-brand-border flex justify-between">
              <span className="text-sm text-brand-muted">Total</span>
              <span className="font-mono text-brand-accent font-medium">
                ${confirmed.totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Status */}
            <div className="pt-3 border-t border-brand-border flex justify-between items-center mt-3">
              <span className="text-sm text-brand-muted">Status</span>
              <span className={`badge border text-xs ${STATUS_STYLES[confirmed.status]}`}>
                {confirmed.status}
              </span>
            </div>

            {/* Type */}
            <div className="pt-3 border-t border-brand-border flex justify-between items-center mt-3">
              <span className="text-sm text-brand-muted">Type</span>
              <span className="text-sm text-brand-primary capitalize">{confirmed.type}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/orders" className="btn-outline flex-1 text-center">Track orders</Link>
            <Link to="/menu"   className="btn-primary flex-1 text-center">Order more</Link>
          </div>
        </div>
      </div>
    )
  }
const isOpen = isRestaurantOpen()
  // ── Checkout form ───────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-brand-primary">Checkout</h1>
          <p className="text-brand-muted text-sm mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} · Pickup order</p>
        </div>
        <Link to="/menu" className="text-xs text-brand-accent hover:underline">← Back to menu</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* ── Order summary — left col ────────────────────────────────── */}
        <div className="md:col-span-3">
          <div className="card">
            <h2 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-4">
              Your order
            </h2>

            <div className="space-y-4">
              {items.map(({ menuItem, quantity }) => (
                <div key={menuItem._id} className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-elevated border
                                  border-brand-border shrink-0">
                    {menuItem.imageUrl
                      ? <img src={menuItem.imageUrl} alt={menuItem.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🍖</div>}
                  </div>

                  {/* Name + qty */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-primary truncate">{menuItem.name}</p>
                    <p className="text-xs text-brand-muted">Qty: {quantity}</p>
                  </div>

                  {/* Line total */}
                  <p className="font-mono text-brand-accent text-sm shrink-0">
                    ${(menuItem.price * quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Divider + total */}
            <div className="mt-5 pt-4 border-t border-brand-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Subtotal</span>
                <span className="font-mono text-brand-primary">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Service type</span>
                <span className="text-brand-primary">Pickup</span>
              </div>
              <div className="flex justify-between text-base font-medium pt-1 border-t border-brand-border">
                <span className="text-brand-primary">Total</span>
                <span className="font-mono text-brand-accent">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Place order — right col ─────────────────────────────────── */}
        <div className="md:col-span-2 space-y-4">

          {/* Account info */}
          <div className="card">
            <h2 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-3">
              Ordering as
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-accent/10 border border-brand-accent/20
                              flex items-center justify-center text-brand-accent font-medium text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-brand-primary">{user?.name}</p>
                <p className="text-xs text-brand-muted">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Pickup info */}
          <div className="card border-brand-accent/20">
            <h2 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-3">
              Pickup info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-brand-muted">
                <span>📍</span>
                <span>Pick up at the counter when ready</span>
              </div>
              <div className="flex items-center gap-2 text-brand-muted">
                <span>⏱</span>
                <span>Estimated wait: 15–25 minutes</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-brand-danger/10 border border-brand-danger/30
                            text-brand-danger text-sm">
              {error.response?.data?.message || 'Failed to place order. Please try again.'}
            </div>
          )}

          {/* CTA */}

                    {!isOpen && (
            <div className="px-4 py-3 rounded-lg bg-red-900/20 border border-red-700/30 text-red-400 text-sm text-center">
              We're currently closed. Orders can be placed daily 12:00 PM – 9:30 PM.
            </div>
          )}
          <button
            onClick={handlePlaceOrder}
            disabled={isPending || !isOpen}
            className="btn-primary w-full text-base py-3"
          >
            {isPending ? 'Placing order…' : `Place order · $${totalPrice.toFixed(2)}`}
          </button>

          <p className="text-xs text-brand-muted text-center">
            By placing your order you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  )
}
