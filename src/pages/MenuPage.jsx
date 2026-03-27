import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import MenuCard from '../components/menu/MenuCard'
import MenuItemModal from '../components/menu/MenuItemModal'
import CartDrawer from '../components/menu/CartDrawer'
import { useCart } from '../context/CartContext'

/**
 * Fetch all menu items from GET /api/menu.
 * React Query caches this for 60s (set in App.jsx defaultOptions).
 */
const fetchMenu = async () => {
  const res = await api.get('/api/menu')
  return res.data
}

export default function MenuPage() {
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['menu'],
    queryFn: fetchMenu,
  })

  const { totalItems } = useCart()

  // ── UI state ────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('')
  const [activeCategory, setCategory] = useState('All')
  const [sort, setSort]               = useState('default') // 'asc' | 'desc' | 'default'
  const [modalItem, setModalItem]     = useState(null)
  const [cartOpen, setCartOpen]       = useState(false)

  // ── Derived data ─────────────────────────────────────────────────────────

  // All unique categories from the API response
  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category))]
    return ['All', ...cats.sort()]
  }, [items])


  // Filtered + sorted grid items (excludes featured so it doesn't appear twice)
  const gridItems = useMemo(() => {
    let result = [...items]

    if (activeCategory !== 'All') {
      result = result.filter((i) => i.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      )
    }
    if (sort === 'asc')  result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'desc') result = [...result].sort((a, b) => b.price - a.price)

    return result
  }, [items, activeCategory, search, sort])

  // ── Loading / error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-80 rounded-2xl bg-brand-elevated animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-60 rounded-xl bg-brand-elevated animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-brand-danger text-sm">Failed to load menu. Please try again.</p>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-4xl text-brand-primary">Our Menu</h1>
            <p className="text-brand-muted text-sm mt-1">{items.length} items</p>
          </div>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 btn-outline py-2 px-4"
          >
            <span>🛒</span>
            <span className="text-sm">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs
                               w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
        </div>


        {/* ── Filters bar ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>

          {/* Price sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input text-sm w-auto md:w-44"
          >
            <option value="default">Sort: Default</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </div>

        {/* ── Category tabs ────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border
                          transition-colors duration-150
                          ${activeCategory === cat
                            ? 'bg-brand-accent text-brand-bg border-brand-accent'
                            : 'bg-brand-surface text-brand-muted border-brand-border hover:border-brand-red hover:text-brand-red'
                          }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Item grid ────────────────────────────────────────────────── */}
        {gridItems.length === 0 ? (
          <div className="py-20 text-center text-brand-muted text-sm">
            No dishes match your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gridItems.map((item) => (
              <MenuCard key={item._id} item={item} onSee={setModalItem} />
            ))}
          </div>
        )}

      </div>

      {/* ── Item detail modal ─────────────────────────────────────────── */}
      {modalItem && (
        <MenuItemModal item={modalItem} onClose={() => setModalItem(null)} />
      )}

      {/* ── Cart drawer ───────────────────────────────────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
