import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import PageTransition from '../ui/PageTransition'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="bg-brand-surface border-t border-brand-border text-brand-muted text-center text-xs py-4 mt-8">
        © {new Date().getFullYear()} KBBQ Restaurant · All rights reserved
      </footer>
    </div>
  )
}
