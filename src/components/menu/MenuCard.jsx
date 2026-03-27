import { useState } from 'react'
import { useCart } from '../../context/CartContext'

export default function MenuCard({ item, onSee, featured = false }) {
  const { addItem, items } = useCart()
  const [hovered, setHovered] = useState(false)
  const qtyInCart = items.find(i => i.menuItem._id === item._id)?.quantity || 0
  const unavailable = !item.isAvailable

  return (
    <div
      className={`group relative rounded-xl overflow-hidden border transition-all duration-200
                  ${unavailable
                    ? 'opacity-50 border-brand-border bg-brand-surface'
                    : 'border-brand-border bg-brand-surface hover:border-brand-accent/40 hover:shadow-lg hover:shadow-brand-accent/5 cursor-pointer'}
                  ${featured ? 'h-80' : 'h-60'}`}
      onMouseEnter={() => !unavailable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-brand-elevated flex items-center justify-center">
          <span className={featured ? 'text-8xl opacity-40' : 'text-5xl opacity-40'}>🥩</span>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Hover overlay */}
      {!unavailable && (
        <div className={`absolute inset-0 bg-brand-bg/60 backdrop-blur-sm flex flex-col items-center
                         justify-center gap-3 transition-opacity duration-200
                         ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={e => { e.stopPropagation(); addItem(item) }}
            className="btn-primary w-36 shadow-lg shadow-brand-accent/20">
            {qtyInCart > 0 ? `Add again (${qtyInCart})` : 'Add to cart'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSee(item) }}
            className="btn-outline w-36 border-brand-primary/40 text-brand-primary hover:border-brand-accent hover:text-brand-accent">
            See dish
          </button>
        </div>
      )}

      {/* Unavailable badge */}
      {unavailable && (
        <div className="absolute top-3 right-3">
          <span className="badge bg-brand-bg/80 text-brand-muted border border-brand-border text-xs">Unavailable</span>
        </div>
      )}

      {/* Cart qty dot */}
      {qtyInCart > 0 && !hovered && (
        <div className="absolute top-3 right-3 bg-brand-accent text-brand-bg text-xs font-bold
                        w-5 h-5 rounded-full flex items-center justify-center shadow">
          {qtyInCart}
        </div>
      )}

      {/* Item info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs text-brand-accent/80 uppercase tracking-wider mb-0.5">{item.category}</p>
        <div className="flex items-end justify-between">
          <h3 className={`text-white font-display leading-tight ${featured ? 'text-2xl' : 'text-base'}`}>
            {item.name}
          </h3>
          <span className="text-brand-accent font-mono text-sm ml-2 shrink-0">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
