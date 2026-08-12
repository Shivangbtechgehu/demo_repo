import { Link, NavLink } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import { NAV_LINKS, APP_NAME } from '../../constants'
import Button from '../ui/Button'
import NotificationBell from '../ui/NotificationBell'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const auth = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-brand-400" />
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'rounded-lg bg-white/10 px-3 py-2 text-sm text-white'
                  : 'rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Show bell only when logged in */}
          {auth?.isAuthenticated && <NotificationBell />}

          {auth?.isAuthenticated ? (
            <Button variant="secondary" onClick={auth.logout}>
              Logout
            </Button>
          ) : (
            <Button to="/login" variant="secondary">
              Login
            </Button>
          )}

          <button
            className="rounded-xl border border-white/10 p-2 text-slate-200 md:hidden"
            type="button"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
