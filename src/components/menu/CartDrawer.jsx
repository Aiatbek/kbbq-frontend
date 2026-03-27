import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function CartDrawer({ open, onClose }) {
  const { items, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart()
  const { user } = useAuth()

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />}
      <div className={`fixed top-14 right-0 min-h-[75vh] h-auto max-h-[calc(100dvh-3.5rem)] w-full max-w-sm z-50 bg-brand-surface border-l
                      border-brand-border flex flex-col transition-transform duration-300
                      ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <h2 className="text-lg font-display text-brand-primary">
            Cart {totalItems > 0 && <span className="text-brand-accent">({totalItems})</span>}
          </h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-primary text-xl" aria-label="Close cart">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <span className="text-5xl opacity-30">🛒</span>
              <p className="text-brand-muted text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map(({ menuItem, quantity }) => (
              <div key={menuItem._id} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-brand-elevated border border-brand-border">
                  {menuItem.imageUrl
                    ? <img src={menuItem.imageUrl} alt={menuItem.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🍖</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-primary truncate">{menuItem.name}</p>
                  <p className="text-xs text-brand-muted font-mono">${menuItem.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => removeItem(menuItem._id)}
                    className="w-6 h-6 rounded-full border border-brand-border text-brand-muted
                               hover:border-brand-accent hover:text-brand-accent text-sm flex items-center
                               justify-center transition-colors">−</button>
                  <span className="text-sm font-mono text-brand-primary w-4 text-center">{quantity}</span>
                  <button onClick={() => addItem(menuItem)}
                    className="w-6 h-6 rounded-full border border-brand-border text-brand-muted
                               hover:border-brand-accent hover:text-brand-accent text-sm flex items-center
                               justify-center transition-colors">+</button>
                </div>
                <p className="text-sm font-mono text-brand-accent w-14 text-right shrink-0">
                  ${(menuItem.price * quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-brand-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Subtotal</span>
              <span className="font-mono text-brand-accent">${totalPrice.toFixed(2)}</span>
            </div>
            {user ? (
              <Link to="/checkout" onClick={onClose} className="btn-primary w-full text-center block">
                Proceed to checkout
              </Link>
            ) : (
              <Link to="/login" onClick={onClose} className="btn-primary w-full text-center block">
                Log in to checkout
              </Link>
            )}
            <button onClick={clearCart} className="w-full text-xs text-brand-muted hover:text-brand-danger transition-colors">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
