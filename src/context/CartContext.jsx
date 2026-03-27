import { createContext, useContext, useState, useCallback } from 'react'

/**
 * CartContext — global cart state.
 * Lives here so the menu page can add items and the order page can read them.
 *
 * Shape:
 *   items        — [{ menuItem, quantity }]
 *   addItem      — fn(menuItem) → increments qty if already in cart
 *   removeItem   — fn(menuItemId) → decrements qty, removes at 0
 *   clearCart    — fn() → empties cart
 *   totalItems   — total count of all items
 *   totalPrice   — sum of price × quantity
 */
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = useCallback((menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem._id === menuItem._id)
      if (existing) {
        return prev.map((i) =>
          i.menuItem._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { menuItem, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem._id === menuItemId)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter((i) => i.menuItem._id !== menuItemId)
      return prev.map((i) =>
        i.menuItem._id === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
      )
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
