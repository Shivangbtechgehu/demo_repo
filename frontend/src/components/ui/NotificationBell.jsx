import { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { cn } from '../../utils/cn'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../services/notificationService'

const TYPE_COLORS = {
  roadmap: 'bg-brand-400/15 text-brand-300',
  goal:    'bg-emerald-400/15 text-emerald-300',
  mentor:  'bg-amber-400/15 text-amber-300',
  project: 'bg-purple-400/15 text-purple-300',
  system:  'bg-slate-400/15 text-slate-300',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)   return 'just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)
  const [markingAll, setMarkingAll]       = useState(false)
  const ref = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch on mount and every 60s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications({ limit: 20, sortOrder: 'desc' })
      setNotifications(data.items || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // Silent fail — don't interrupt the user
    }
  }

  const handleOpen = () => {
    setOpen((v) => !v)
    if (!open) fetchNotifications()
  }

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      toast.error('Could not mark as read.')
    }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      toast.error('Could not mark all as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      const deleted = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (deleted && !deleted.read) setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      toast.error('Could not delete notification.')
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative rounded-xl border border-white/10 p-2 text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-300">
                    {unreadCount} new
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-500 hover:text-white transition"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <ul className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                /* Empty state */
                <li className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                  <Bell className="h-8 w-8 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">No notifications yet</p>
                  <p className="text-xs text-slate-600">
                    We'll notify you when something important happens.
                  </p>
                </li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'group flex gap-3 px-4 py-3 transition',
                      !n.read && 'bg-white/[0.03]',
                    )}
                  >
                    {/* Type badge dot */}
                    <span
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        !n.read ? 'bg-brand-400' : 'bg-transparent',
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-medium', n.read ? 'text-slate-400' : 'text-white')}>
                          {n.title}
                        </p>
                        {/* Actions — visible on hover */}
                        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition">
                          {!n.read && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="rounded p-0.5 text-slate-500 hover:text-emerald-400 transition"
                              aria-label="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="rounded p-0.5 text-slate-500 hover:text-rose-400 transition"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', TYPE_COLORS[n.type] || TYPE_COLORS.system)}>
                          {n.type}
                        </span>
                        <span className="text-[10px] text-slate-600">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
