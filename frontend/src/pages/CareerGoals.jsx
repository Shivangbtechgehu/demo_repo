import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Pencil, Trash2, X, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import { FilterSelect, SortOrderToggle } from '../components/ui/FilterControls'
import { useListQuery } from '../hooks/useListQuery'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/careerGoalService'
import { formatDateTime } from '../utils/formatters'
import { cn } from '../utils/cn'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['active', 'paused', 'completed']

const PRIORITY_COLORS = {
  low: 'text-slate-400 bg-slate-400/10',
  medium: 'text-amber-300 bg-amber-400/10',
  high: 'text-rose-300 bg-rose-400/10',
}

const STATUS_COLORS = {
  active: 'text-emerald-300 bg-emerald-400/10',
  paused: 'text-amber-300 bg-amber-400/10',
  completed: 'text-brand-300 bg-brand-400/10',
}

function GoalForm({ initial, onSave, onCancel, isSaving }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      title: initial?.title || '',
      targetRole: initial?.targetRole || '',
      description: initial?.description || '',
      targetDate: initial?.targetDate ? initial.targetDate.slice(0, 10) : '',
      priority: initial?.priority || 'medium',
      status: initial?.status || 'active',
      notes: initial?.notes || '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await onSave(values)
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Goal title"
          placeholder="e.g. Become a Backend Engineer"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required.' })}
        />
        <Input
          label="Target role"
          placeholder="e.g. Backend Engineer"
          error={errors.targetRole?.message}
          {...register('targetRole', { required: 'Target role is required.' })}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Description</span>
        <textarea
          rows={2}
          placeholder="What does achieving this goal look like?"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
          {...register('description')}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Target date</span>
          <input
            type="date"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40"
            {...register('targetDate')}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Priority</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
            {...register('priority')}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Status</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
            {...register('status')}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Notes</span>
        <textarea
          rows={2}
          placeholder="Any extra notes…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
          {...register('notes')}
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSaving}>
          {initial ? 'Save changes' : 'Create goal'}
        </Button>
      </div>
    </form>
  )
}

export default function CareerGoals() {
  const fetchGoals = useCallback((p) => getGoals(p), [])
  const { items: goals, meta, loading, params, setSearch, setFilter, setSortBy, setSortOrder, setPage, refresh } = useListQuery(fetchGoals, { limit: 12 })

  const [showForm, setShowForm]     = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [deletingId, setDeletingId]  = useState(null)
  const [isSaving, setIsSaving]      = useState(false)
  const [isDeleting, setIsDeleting]  = useState(false)

  const handleCreate = async (values) => {
    setIsSaving(true)
    try {
      await createGoal(values)
      setShowForm(false)
      toast.success('Goal created.')
      refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (values) => {
    setIsSaving(true)
    try {
      await updateGoal(editingGoal.id, values)
      setEditingGoal(null)
      toast.success('Goal updated.')
      refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteGoal(deletingId)
      setDeletingId(null)
      toast.success('Goal deleted.')
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading goals…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Planning"
          title="Career Goals"
          description="Define the roles you're targeting. Each goal drives your gap analysis and roadmap."
          action={
            !showForm && !editingGoal ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> New goal
              </Button>
            ) : null
          }
        />

        {/* Create form */}
        <AnimatePresence>
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold text-white">New career goal</p>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <GoalForm onSave={handleCreate} onCancel={() => setShowForm(false)} isSaving={isSaving} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Edit form */}
        <AnimatePresence>
          {editingGoal ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold text-white">Edit goal</p>
                <button onClick={() => setEditingGoal(null)} className="text-slate-400 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <GoalForm
                initial={editingGoal}
                onSave={handleUpdate}
                onCancel={() => setEditingGoal(null)}
                isSaving={isSaving}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Search + filter toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={params.search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search goals…"
            className="min-w-[200px]"
          />
          <FilterSelect
            value={params.status || ''}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: 'active',    label: 'Active'    },
              { value: 'paused',    label: 'Paused'    },
              { value: 'completed', label: 'Completed' },
            ]}
            placeholder="All statuses"
          />
          <FilterSelect
            value={params.priority || ''}
            onChange={(v) => setFilter('priority', v)}
            options={[
              { value: 'low',    label: 'Low'    },
              { value: 'medium', label: 'Medium' },
              { value: 'high',   label: 'High'   },
            ]}
            placeholder="All priorities"
          />
          <FilterSelect
            value={params.sortBy}
            onChange={setSortBy}
            options={[
              { value: 'createdAt',  label: 'Created'   },
              { value: 'title',      label: 'Title'     },
              { value: 'priority',   label: 'Priority'  },
              { value: 'status',     label: 'Status'    },
            ]}
            placeholder="Sort by"
          />
          <SortOrderToggle sortOrder={params.sortOrder} onChange={setSortOrder} />
        </div>

        {/* Goals list */}
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Create your first career goal to start building your personalised roadmap."
            action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New goal</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="glass-panel rounded-3xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{goal.title}</p>
                    <p className="mt-0.5 text-sm text-slate-400 truncate">{goal.targetRole}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                      aria-label="Edit goal"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(goal.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {goal.description ? (
                  <p className="text-sm text-slate-400 line-clamp-2">{goal.description}</p>
                ) : null}

                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', PRIORITY_COLORS[goal.priority])}>
                    {goal.priority}
                  </span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[goal.status])}>
                    {goal.status}
                  </span>
                </div>

                {goal.targetDate ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Target: {formatDateTime(goal.targetDate)}</span>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={setPage} />
      </motion.div>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete goal?"
        description="This will permanently delete the goal and cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={isDeleting}
      />
    </section>
  )
}