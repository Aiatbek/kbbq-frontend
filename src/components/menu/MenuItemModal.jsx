import { useCart } from '../../context/CartContext'

export default function MenuItemModal({ item, onClose }) {
  const { addItem, items } = useCart()
  const qtyInCart = items.find(i => i.menuItem._id === item._id)?.quantity || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="relative bg-brand-elevated rounded-2xl border border-brand-border shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-brand-surface flex items-center justify-center">
            <span className="text-7xl">🍖</span>
          </div>
        )}

        <button onClick={onClose}
          className="absolute top-3 right-3 bg-brand-bg/80 rounded-full w-8 h-8 flex items-center
                     justify-center text-brand-muted hover:text-brand-primary border border-brand-border
                     transition-colors text-sm">
          ✕
        </button>

        <div className="p-6">
          <span className="text-xs font-medium uppercase tracking-wider text-brand-accent bg-brand-accent/10
                           px-2.5 py-0.5 rounded-full border border-brand-accent/20">
            {item.category}
          </span>

          <h2 className="text-2xl text-brand-primary mt-3 mb-1">{item.name}</h2>
          <p className="text-brand-muted text-sm leading-relaxed mb-5">{item.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono text-brand-accent">${item.price.toFixed(2)}</span>
            {item.isAvailable ? (
              <div className="flex items-center gap-3">
                {qtyInCart > 0 && (
                  <span className="text-xs text-brand-muted font-mono">{qtyInCart} in cart</span>
                )}
                <button onClick={() => addItem(item)} className="btn-primary">Add to cart</button>
              </div>
            ) : (
              <span className="badge bg-brand-elevated text-brand-muted border border-brand-border">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
