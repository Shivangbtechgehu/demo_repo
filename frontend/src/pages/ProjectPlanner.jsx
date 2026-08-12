import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban, Plus, Trash2, CheckCircle2, Circle,
  ChevronDown, ChevronUp, X, Link2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import { FilterSelect, SortOrderToggle } from '../components/ui/FilterControls'
import { useListQuery } from '../hooks/useListQuery'
import {
  getProjects, createProject, updateProject, deleteProject,
  addTask, updateTask, deleteTask,
} from '../services/projectService'
import { getRoadmaps } from '../services/roadmapService'
import { cn } from '../utils/cn'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  planned:     'text-slate-300 bg-slate-400/10',
  in_progress: 'text-amber-300 bg-amber-400/10',
  completed:   'text-emerald-300 bg-emerald-400/10',
  on_hold:     'text-rose-300 bg-rose-400/10',
}

function ProgressBar({ percentage }) {
  const color = percentage >= 75 ? 'bg-emerald-400' : percentage >= 40 ? 'bg-amber-400' : 'bg-brand-400'
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

// ── Create project form ──────────────────────────────────────────────────────
function CreateProjectForm({ roadmaps, onSave, onCancel, isSaving }) {
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    defaultValues: { title: '', description: '', roadmapId: '', linkedStepOrder: '' },
  })

  const onSubmit = async (values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        roadmapId: values.roadmapId || undefined,
        linkedStepOrder: values.linkedStepOrder ? Number(values.linkedStepOrder) : undefined,
      }
      await onSave(payload)
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

      <Input
        label="Project title"
        placeholder="e.g. Build a REST API"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required.' })}
      />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Description</span>
        <textarea
          rows={3}
          placeholder="What will you build and what will you learn?"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
          {...register('description')}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Link to roadmap (optional)</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
            {...register('roadmapId')}
          >
            <option value="">— none —</option>
            {roadmaps.map((r) => (
              <option key={r.id} value={r.id}>{r.goalTitle}</option>
            ))}
          </select>
        </label>

        <Input
          label="Roadmap step # (optional)"
          type="number"
          placeholder="e.g. 2"
          {...register('linkedStepOrder')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSaving}>Create project</Button>
      </div>
    </form>
  )
}

// ── Task row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, projectId, onProjectUpdated }) {
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      const updated = await updateTask(projectId, task.id, { completed: !task.completed })
      onProjectUpdated(updated)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const updated = await deleteTask(projectId, task.id)
      onProjectUpdated(updated)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <li className="group flex items-center gap-3 py-2">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className="shrink-0 text-slate-400 hover:text-brand-300 transition disabled:opacity-50"
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed
          ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          : <Circle className="h-5 w-5" />}
      </button>
      <span className={cn('flex-1 text-sm', task.completed ? 'line-through text-slate-500' : 'text-slate-200')}>
        {task.title}
      </span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition disabled:opacity-50"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  )
}

// ── Add task inline ───────────────────────────────────────────────────────────
function AddTaskInline({ projectId, onProjectUpdated }) {
  const [value, setValue]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [show, setShow]       = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setSaving(true)
    try {
      const updated = await addTask(projectId, { title: value.trim() })
      onProjectUpdated(updated)
      setValue('')
      setShow(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-300 transition mt-2"
      >
        <Plus className="h-3.5 w-3.5" /> Add task
      </button>
    )
  }

  return (
    <form onSubmit={handleAdd} className="mt-2 flex gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Task title…"
        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-brand-400"
      />
      <Button type="submit" isLoading={saving} className="text-xs px-3 py-2">Add</Button>
      <Button variant="ghost" type="button" onClick={() => setShow(false)} className="text-xs px-3 py-2">
        <X className="h-3.5 w-3.5" />
      </Button>
    </form>
  )
}

// ── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, roadmaps, onUpdated, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const cfg = STATUS_COLORS[project.status] || STATUS_COLORS.planned
  const linkedRoadmap = roadmaps.find((r) => r.id === project.roadmapId)

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true)
    try {
      const updated = await updateProject(project.id, { status: newStatus })
      onUpdated(updated)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{project.title}</p>
            {linkedRoadmap ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-300">
                <Link2 className="h-3 w-3" />
                {linkedRoadmap.goalTitle}
                {project.linkedStepOrder ? ` · Step ${project.linkedStepOrder}` : ''}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', cfg)}>
              {project.status.replace('_', ' ')}
            </span>
            <button
              onClick={() => onDelete(project.id)}
              className="text-slate-500 hover:text-rose-400 transition"
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {project.description ? (
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">{project.description}</p>
        ) : null}

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{project.tasks.filter((t) => t.completed).length}/{project.tasks.length} tasks</span>
            <span>{project.completionPercentage}%</span>
          </div>
          <ProgressBar percentage={project.completionPercentage} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Hide tasks' : `Tasks (${project.tasks.length})`}
          </button>

          {/* Quick status buttons */}
          {project.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={isUpdating}
              className="ml-auto text-xs text-emerald-400 hover:text-emerald-300 transition disabled:opacity-50"
            >
              Mark complete
            </button>
          )}
          {project.status === 'completed' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={isUpdating}
              className="ml-auto text-xs text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
            >
              Reopen
            </button>
          )}
        </div>
      </div>

      {/* Tasks panel */}
      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 px-5 pb-4 pt-3 sm:px-6"
          >
            {project.tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No tasks yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {project.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    projectId={project.id}
                    onProjectUpdated={onUpdated}
                  />
                ))}
              </ul>
            )}
            <AddTaskInline projectId={project.id} onProjectUpdated={onUpdated} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProjectPlanner() {
  const fetchProjects = useCallback((p) => getProjects(p), [])
  const { items: projects, meta, loading, params, setSearch, setFilter, setSortBy, setSortOrder, setPage, refresh } = useListQuery(fetchProjects, { limit: 12 })

  const [roadmaps, setRoadmaps]     = useState([])
  const [showForm, setShowForm]     = useState(false)
  const [isSaving, setIsSaving]     = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getRoadmaps().then((d) => setRoadmaps(d?.items ?? d ?? [])).catch(() => {})
  }, [])

  const handleCreate = async (payload) => {
    setIsSaving(true)
    try {
      await createProject(payload)
      setShowForm(false)
      toast.success('Project created.')
      refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdated = () => refresh()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(deletingId)
      setDeletingId(null)
      toast.success('Project deleted.')
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const completed   = projects.filter((p) => p.status === 'completed').length
  const inProgress  = projects.filter((p) => p.status === 'in_progress').length
  const planned     = projects.filter((p) => p.status === 'planned').length

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading projects…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Projects"
          title="Project Planner"
          description="Create projects linked to your roadmap steps. Break each project into tasks and track completion."
          action={
            !showForm ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> New project
              </Button>
            ) : null
          }
        />

        {/* Stats */}
        {projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Planned"     value={planned}    icon={FolderKanban} accent="text-slate-400" />
            <StatCard label="In Progress" value={inProgress} icon={FolderKanban} accent="text-amber-400" />
            <StatCard label="Completed"   value={completed}  icon={CheckCircle2} accent="text-emerald-400" />
          </div>
        )}

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
                <p className="font-semibold text-white">New project</p>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CreateProjectForm
                roadmaps={roadmaps}
                onSave={handleCreate}
                onCancel={() => setShowForm(false)}
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
            placeholder="Search projects…"
            className="min-w-[200px]"
          />
          <FilterSelect
            value={params.status || ''}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: 'planned',     label: 'Planned'     },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed',   label: 'Completed'   },
              { value: 'on_hold',     label: 'On Hold'     },
            ]}
            placeholder="All statuses"
          />
          <FilterSelect
            value={params.sortBy}
            onChange={setSortBy}
            options={[
              { value: 'createdAt',            label: 'Created'    },
              { value: 'title',                label: 'Title'      },
              { value: 'completionPercentage', label: 'Completion' },
            ]}
            placeholder="Sort by"
          />
          <SortOrderToggle sortOrder={params.sortOrder} onChange={setSortOrder} />
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project and link it to a roadmap step to start building evidence."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> New project
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                roadmaps={roadmaps}
                onUpdated={handleUpdated}
                onDelete={setDeletingId}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={setPage} />
      </motion.div>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete project?"
        description="This will permanently delete the project and all its tasks."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={isDeleting}
      />    </section>
  )
}
