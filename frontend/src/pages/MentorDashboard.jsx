import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, CheckCircle2, XCircle, Clock,
  MessageSquare, ChevronDown, ChevronUp, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import {
  getMentorDashboard,
  createReview,
  updateReview,
} from '../services/mentorReviewService'
import { cn } from '../utils/cn'

const STATUS_CONFIG = {
  pending:  { icon: Clock,        color: 'text-amber-300 bg-amber-400/10',    label: 'Pending'  },
  approved: { icon: CheckCircle2, color: 'text-emerald-300 bg-emerald-400/10', label: 'Approved' },
  rejected: { icon: XCircle,      color: 'text-rose-300 bg-rose-400/10',      label: 'Rejected' },
}

// ── New review form ──────────────────────────────────────────────────────────
function NewReviewForm({ onSave, onCancel, isSaving }) {
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    defaultValues: { roadmapId: '', studentId: '', comment: '' },
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
          label="Roadmap ID"
          placeholder="Paste the roadmap ID"
          error={errors.roadmapId?.message}
          {...register('roadmapId', { required: 'Roadmap ID is required.' })}
        />
        <Input
          label="Student ID"
          placeholder="Paste the student ID"
          error={errors.studentId?.message}
          {...register('studentId', { required: 'Student ID is required.' })}
        />
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Review comment</span>
        <textarea
          rows={4}
          placeholder="Write your detailed feedback here…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
          {...register('comment', { required: 'Comment is required.', minLength: { value: 5, message: 'Min 5 characters.' } })}
        />
        {errors.comment ? <p className="text-sm text-rose-300">{errors.comment.message}</p> : null}
      </label>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSaving}>Submit review</Button>
      </div>
    </form>
  )
}

// ── Review card ──────────────────────────────────────────────────────────────
function ReviewCard({ review, onUpdate }) {
  const [expanded, setExpanded]   = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const cfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending
  const StatusIcon = cfg.icon

  const handleStatus = async (newStatus) => {
    setIsUpdating(true)
    try {
      const updated = await updateReview(review.id, { status: newStatus })
      onUpdate(updated)
      toast.success(`Review marked as ${newStatus}.`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Student: {review.student?.name || review.studentId}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Roadmap: {review.roadmapId}
            </p>
          </div>
          <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0', cfg.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {cfg.label}
          </span>
        </div>

        {/* Comment preview */}
        <p className="mt-3 text-sm text-slate-400 line-clamp-2">{review.comment}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Approve / Reject buttons — only shown when pending */}
          {review.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                onClick={() => handleStatus('approved')}
                isLoading={isUpdating}
                className="text-emerald-300 border-emerald-400/20 hover:bg-emerald-400/10 text-xs px-3 py-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatus('rejected')}
                isLoading={isUpdating}
                className="text-rose-300 border-rose-400/20 hover:bg-rose-400/10 text-xs px-3 py-1.5"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Less' : 'Full comment'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 px-5 py-4"
          >
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
            <p className="mt-3 text-xs text-slate-600">
              Submitted: {new Date(review.createdAt).toLocaleString()}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MentorDashboard() {
  const [reviews, setReviews]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [isSaving, setIsSaving]   = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await getMentorDashboard()
      setReviews(data || [])
    } catch {
      toast.error('Failed to load reviews.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values) => {
    setIsSaving(true)
    try {
      const review = await createReview(values)
      setReviews((prev) => [review, ...prev])
      setShowForm(false)
      toast.success('Review submitted.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = (updated) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const pending  = reviews.filter((r) => r.status === 'pending').length
  const approved = reviews.filter((r) => r.status === 'approved').length
  const rejected = reviews.filter((r) => r.status === 'rejected').length

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading mentor dashboard…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Mentor"
          title="Review Dashboard"
          description="Submit and manage reviews for student roadmaps. Approve or reject with feedback."
          action={
            !showForm ? (
              <Button onClick={() => setShowForm(true)}>
                <MessageSquare className="h-4 w-4" /> New review
              </Button>
            ) : null
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending"  value={pending}  icon={Clock}        accent="text-amber-400"   />
          <StatCard label="Approved" value={approved} icon={CheckCircle2} accent="text-emerald-400" />
          <StatCard label="Rejected" value={rejected} icon={XCircle}      accent="text-rose-400"    />
        </div>

        {/* New review form */}
        <AnimatePresence>
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold text-white">Submit a new review</p>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NewReviewForm
                onSave={handleCreate}
                onCancel={() => setShowForm(false)}
                isSaving={isSaving}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No reviews yet"
            description="Submit your first review for a student roadmap."
            action={<Button onClick={() => setShowForm(true)}><MessageSquare className="h-4 w-4" /> New review</Button>}
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
