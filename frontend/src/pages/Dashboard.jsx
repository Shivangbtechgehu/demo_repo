import { CalendarDays, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { formatDateTime } from '../utils/formatters'

export default function Dashboard() {
  const auth = useAuth()

  return (
    <section className="page-shell py-12 sm:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Welcome, {auth.user?.name || 'User'}</h1>
            </div>
            <ShieldCheck className="h-10 w-10 text-brand-400" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-1 text-white">{auth.user?.email || 'not available'}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Session status</p>
              <p className="mt-1 inline-flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Active
              </p>
            </div>
          </div>
        </div>

        <aside className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 text-slate-200">
            <CalendarDays className="h-5 w-5 text-brand-400" />
            <span className="font-medium">Session details</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Auth state is persisted in localStorage. Replace the mock auth service with your backend API when you are ready.
          </p>
          <p className="mt-4 text-sm text-slate-400">Checked at {formatDateTime(new Date())}</p>
        </aside>
      </div>
    </section>
  )
}
