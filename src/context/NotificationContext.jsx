import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import socket from '../lib/socket'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

/**
 * NotificationContext — real-time socket connection + notification state.
 *
 * Responsibilities:
 *   - Connect/disconnect socket when user logs in/out
 *   - Join the right rooms (admin room OR user_<id> room)
 *   - Track unseen new order count for the admin badge
 *   - Play a notification sound on every new order (admin only)
 *   - Expose clearUnseenOrders() so the admin page can reset the badge
 */
const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [unseenOrders, setUnseenOrders] = useState(0)
  const audioRef = useRef(null)

  // ── Audio setup — create a simple beep using Web Audio API ───────────────
  const playSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)       // A5
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1) // E5
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } catch {
      // AudioContext not available — silently skip
    }
  }, [])

  const clearUnseenOrders = useCallback(() => setUnseenOrders(0), [])

  // ── Socket lifecycle — connect when user is known, disconnect on logout ───
  useEffect(() => {
    if (!user) {
      socket.disconnect()
      return
    }

    socket.connect()

    // Join the appropriate rooms
    if (isAdmin) {
      socket.emit('join', 'admin')
    }
    // Every logged-in user joins their personal room for order/reservation updates
    socket.emit('join', `user_${user.id}`)

    return () => {
      socket.disconnect()
    }
  }, [user, isAdmin])

  // ── Event listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    // New order — admin only
    const onNewOrder = (order) => {
      if (!isAdmin) return
      setUnseenOrders(n => n + 1)
      playSound()
      const customerName = order.userId?.name ?? 'Someone'
      showToast(`🍖 New order from ${customerName} · $${order.totalPrice.toFixed(2)}`, 'info', 6000)
    }

    // Order status updated — relevant to both admin and customer
    const onOrderStatusUpdated = (order) => {
      if (!isAdmin) {
        // Customer gets a toast when their order status changes
        showToast(`Your order is now ${order.status.toUpperCase()} 🔥`, 'success', 5000)
      }
      // Admin view is updated via React Query invalidation in the page component
    }

    // New reservation — admin only
    const onNewReservation = (reservation) => {
      if (!isAdmin) return
      showToast(`📅 New booking from ${reservation.name} — ${reservation.numberOfGuests} guests`, 'info', 6000)
    }

    // Reservation status updated — customer gets toast
    const onReservationStatusUpdated = (reservation) => {
      if (!isAdmin) {
        const msg =
          reservation.status === 'confirmed' ? '✅ Your reservation is confirmed!'
          : reservation.status === 'cancelled' ? '❌ Your reservation was cancelled.'
          : `Your reservation status: ${reservation.status}`
        showToast(msg, reservation.status === 'cancelled' ? 'error' : 'success', 6000)
      }
    }

    socket.on('newOrder',                onNewOrder)
    socket.on('orderStatusUpdated',      onOrderStatusUpdated)
    socket.on('newReservation',          onNewReservation)
    socket.on('reservationStatusUpdated', onReservationStatusUpdated)

    return () => {
      socket.off('newOrder',                onNewOrder)
      socket.off('orderStatusUpdated',      onOrderStatusUpdated)
      socket.off('newReservation',          onNewReservation)
      socket.off('reservationStatusUpdated', onReservationStatusUpdated)
    }
  }, [isAdmin, playSound, showToast])

  return (
    <NotificationContext.Provider value={{ unseenOrders, clearUnseenOrders }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within <NotificationProvider>')
  return ctx
}
