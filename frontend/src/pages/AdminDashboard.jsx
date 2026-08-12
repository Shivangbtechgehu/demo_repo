import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Target, Zap, Map, FolderKanban,
  ShieldCheck, Trash2, RefreshCw, TrendingUp,
  Bell, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import ErrorMessage from '../components/ui/ErrorMessage'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
} from '../services/adminService'
import { cn } from '../utils/cn'

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent = 'text-brand-400', sub }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon ? <Icon className={cn('h-5 w-5', accent)} /> : null}
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}

// ── Mini bar chart (pure CSS, no library needed) ─────────────────────────────
function BarChart({ data, label }) {
  if (!data?.length) return null
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="mb-4 text-sm font-semibold text-white">{label}</p>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.round((d.count / max) * 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full rounded-t bg-brand-500/70 min-h-[2px]"
            />
            <span className="text-[9px] text-slate-600 truncate w-full text-center">
              {d.date?.slice(5)} {/* MM-DD */}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Role badge ───────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  student: 'text-slate-300 bg-slate-400/10',
  mentor:  'text-amber-300 bg-amber-400/10',
  admin:   'text-brand-300 bg-brand-400/10',
}

function RoleBadge({ role }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', ROLE_COLORS[role] || ROLE_COLORS.student)}>
      {role}
    </span>
  )
}

// ── Audit log row ─────────────────────────────────────────────────────────────
function AuditRow({ log }) {
  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.02] transition">
      <td className="px-4 py-3 text-xs text-slate-300 font-mono">{log.action}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{log.resourceType}</td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {new Date(log.timestamp).toLocaleString()}
      </td>
    </tr>
  )
}

// ── User row ─────────────────────────────────────────────────────────────────
function UserRow({ user, onRoleChange, onDelete }) {
  const [updating, setUpdating] = useState(false)

  const handleRole = async (newRole) => {
    if (newRole === user.role) return
    setUpdating(true)
    try {
      const updated = await updateUserRole(user.id, newRole)
      onRoleChange(updated)
      toast.success(`${user.name}'s role updated to ${newRole}.`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.02] transition">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-xs', user.isEmailVerified ? 'text-emerald-400' : 'text-rose-400')}>
          {user.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={user.role}
            onChange={(e) => handleRole(e.target.value)}
            disabled={updating}
            className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-400 disabled:opacity-50"
          >
            <option value="student">student</option>
            <option value="mentor">mentor</option>
            <option value="admin">admin</option>
          </select>
          <button
            onClick={() => onDelete(user.id)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
            aria-label="Delete user"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [data, setData]           = useState(null)
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Guard — redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const [stats, usersData] = await Promise.all([
        getDashboardStats(),
        getUsers({ limit: 20 }),
      ])
      setData(stats)
      setUsers(usersData.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const handleRoleChange = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteUser(deletingId)
      setUsers((prev) => prev.filter((u) => u.id !== deletingId))
      setDeletingId(null)
      toast.success('User deleted.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading admin dashboard…" />
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-shell py-12">
        <ErrorMessage title="Failed to load dashboard" message={error} />
      </section>
    )
  }

  const { stats, recentUsers, recentAuditLogs, userGrowth } = data

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

        {/* Header */}
        <PageHeader
          eyebrow="Admin"
          title="Admin Dashboard"
          description="Platform overview — users, content, and activity."
          action={
            <Button variant="secondary" onClick={handleRefresh} isLoading={refreshing}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users"    value={stats.totalUsers}    icon={Users}        accent="text-brand-400"   sub={`${stats.totalStudents} students · ${stats.totalMentors} mentors`} />
          <StatCard label="Career Goals"   value={stats.totalGoals}    icon={Target}       accent="text-amber-400"   />
          <StatCard label="Skills"         value={stats.totalSkills}   icon={Zap}          accent="text-emerald-400" />
          <StatCard label="Roadmaps"       value={stats.totalRoadmaps} icon={Map}          accent="text-purple-400"  sub={`${stats.roadmapCompletionRate}% completed`} />
          <StatCard label="Projects"       value={stats.totalProjects} icon={FolderKanban} accent="text-cyan-400"    />
          <StatCard label="Notifications"  value={stats.totalNotifications} icon={Bell}    accent="text-rose-400"    />
          <StatCard label="Admins"         value={stats.totalAdmins}   icon={ShieldCheck}  accent="text-brand-300"   />
          <StatCard label="Completion Rate" value={`${stats.roadmapCompletionRate}%`} icon={CheckCircle2} accent="text-emerald-400" />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart data={userGrowth} label="New users — last 7 days" />

          {/* Roadmap completion donut (CSS-only) */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-white">Roadmap completion rate</p>
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
                <svg width="96" height="96" className="-rotate-90">
                  <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <motion.circle
                    cx="48" cy="48" r="36"
                    fill="none" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 36}
                    initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - stats.roadmapCompletionRate / 100) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="stroke-emerald-400"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-white">{stats.roadmapCompletionRate}%</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Completed roadmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="text-slate-500">Active / draft</span>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Total: {stats.totalRoadmaps} roadmaps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User management table */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <p className="font-semibold text-white">User Management</p>
            <span className="text-xs text-slate-500">{users.length} users shown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">User</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Role</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Joined</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      onRoleChange={handleRoleChange}
                      onDelete={setDeletingId}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent audit logs table */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <p className="font-semibold text-white">Recent Activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Action</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Resource</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAuditLogs?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                      No activity yet.
                    </td>
                  </tr>
                ) : (
                  recentAuditLogs?.map((log) => (
                    <AuditRow key={log._id || log.id} log={log} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete user?"
        description="This permanently deletes the user account. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={isDeleting}
      />
    </section>
  )
}
