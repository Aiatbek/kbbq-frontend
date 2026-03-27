import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
import Layout from './components/layout/Layout'
import PrivateRoute from './routes/PrivateRoute'
import AdminRoute from './routes/AdminRoute'
import GuestRoute from './routes/GuestRoute'
import { NotFoundPage } from './pages'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MenuPage from './pages/MenuPage'
import AdminMenuPage from './pages/AdminMenuPage'
import ReservationsPage from './pages/ReservationsPage'
import AdminReservationsPage from './pages/AdminReservationsPage'
import CheckoutPage from './pages/CheckoutPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import HomePage from './pages/HomePage'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

/**
 * Provider stack (outer → inner):
 *   ErrorBoundary        — catches render crashes
 *   QueryClientProvider  — React Query cache
 *   BrowserRouter        — routing context
 *   AuthProvider         — session auth state
 *   CartProvider         — shopping cart state
 *   ToastProvider        — global toast notifications
 *
 * Route tree:
 *   /                        HomePage          (public)
 *   /menu                    MenuPage          (public)
 *   /login                   LoginPage         (guest only)
 *   /register                RegisterPage      (guest only)
 *   /reservations            ReservationsPage  (auth)
 *   /orders                  MyOrdersPage      (auth)
 *   /checkout                CheckoutPage      (auth)
 *   /admin                   AdminMenuPage     (admin)
 *   /admin/reservations      AdminReservationsPage (admin)
 *   /admin/orders            AdminOrdersPage   (admin)
 */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <NotificationProvider>
                <Routes>
                  <Route element={<Layout />}>

                    {/* Public */}
                    <Route path="/"    element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />

                    {/* Guest only */}
                    <Route element={<GuestRoute />}>
                      <Route path="/login"    element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    {/* Auth protected */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/reservations" element={<ReservationsPage />} />
                      <Route path="/orders"        element={<MyOrdersPage />} />
                      <Route path="/checkout"      element={<CheckoutPage />} />
                    </Route>

                    {/* Admin only */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin"               element={<AdminMenuPage />} />
                      <Route path="/admin/reservations"  element={<AdminReservationsPage />} />
                      <Route path="/admin/orders"        element={<AdminOrdersPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
                </NotificationProvider>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
