import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import { FilterSelect, SortOrderToggle } from '../components/ui/FilterControls'
import { useListQuery } from '../hooks/useListQuery'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService'
import { cn } from '../utils/cn'

const TYPE_COLORS = {
  roadmap: 'bg-brand-400/15 text-brand-300',
  goal:    'bg-emerald-400/15 text-emerald-300',
  mentor:  'bg-amber-400/15 text-amber-300',
  project: 'bg-purple-400/15 text-purple-300',
  system:  'bg-slate-400/15 text-slate-300',
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Notifications() {
  const fetchNotifications = useCallback((p) => getNotifications(p), [])
  const {
    items: notifications, meta, loading, params,
    setFilter, setSortBy, setSortOrder, setPage, refresh,
  } = useListQuery(fetchNotifications, { limit: 15 })

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      refresh()
    } catch { toast.error('Could not mark as read.') }
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
      toast.success('All marked as read.')
      refresh()
    } catch { toast.error('Could not mark all as read.') }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      refresh()
    } catch { toast.error('Could not delete.') }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading notifications…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          description="All your platform notifications in one place."
          action={
            <Button variant="secondary" onClick={handleMarkAll}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          }
        />

        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={params.type || ''}
            onChange={(v) => setFilter('type', v)}
            options={[
              { value: 'roadmap', label: 'Roadmap' },
              { value: 'goal',    label: 'Goal'    },
              { value: 'mentor',  label: 'Mentor'  },
              { value: 'project', label: 'Project' },
              { value: 'system',  label: 'System'  },
            ]}
            placeholder="All types"
          />
          <FilterSelect
            value={params.read ?? ''}
            onChange={(v) => setFilter('read', v)}
            options={[
              { value: 'false', label: 'Unread' },
              { value: 'true',  label: 'Read'   },
            ]}
            placeholder="All"
          />
          <FilterSelect
            value={params.sortBy}
            onChange={setSortBy}
            options={[
              { value: 'createdAt', label: 'Date'  },
              { value: 'type',      label: 'Type'  },
            ]}
            placeholder="Sort by"
          />
          <SortOrderToggle sortOrder={params.sortOrder} onChange={setSortOrder} />
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="glass-panel rounded-3xl divide-y divide-white/5 overflow-hidden">
            {notifications.map((n) => (
              <div key={n.id} className={cn('group flex gap-3 px-5 py-4 transition', !n.read && 'bg-white/[0.03]')}>
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', !n.read ? 'bg-brand-400' : 'bg-transparent')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', n.read ? 'text-slate-400' : 'text-white')}>
                      {n.title}
                    </p>
                    <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition">
                      {!n.read && (
                        <button onClick={() => handleMarkRead(n.id)} className="rounded p-1 text-slate-500 hover:text-emerald-400 transition" aria-label="Mark read">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="rounded p-1 text-slate-500 hover:text-rose-400 transition" aria-label="Delete">
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
              </div>
            ))}
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </motion.div>
    </section>
  )
}
