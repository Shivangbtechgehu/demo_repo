import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, RefreshCw, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  initializeProgress,
  getProgressByRoadmap,
  getAllProgress,
  updateMilestone,
  resetProgress,
} from '../services/progressService'
import { getRoadmaps } from '../services/roadmapService'
import { cn } from '../utils/cn'

function ProgressBar({ percentage }) {
  const color =
    percentage >= 75
      ? 'bg-emerald-400'
      : percentage >= 40
        ? 'bg-amber-400'
        : 'bg-rose-400'

  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

function MilestoneItem({ milestone, onToggle, isUpdating }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <button
        onClick={() => onToggle(milestone.stepOrder, !milestone.completed)}
        disabled={isUpdating}
        className="mt-0.5 shrink-0 text-slate-400 hover:text-brand-300 transition disabled:opacity-50"
        aria-label={milestone.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {milestone.completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-medium transition',
            milestone.completed ? 'line-through text-slate-500' : 'text-white',
          )}
        >
          {milestone.stepTitle}
        </p>
        {milestone.completed && milestone.completedAt ? (
          <p className="mt-0.5 text-xs text-slate-600">
            Completed {new Date(milestone.completedAt).toLocaleDateString()}
          </p>
        ) : null}
      </div>
      <span className="ml-auto shrink-0 text-xs text-slate-600">#{milestone.stepOrder}</span>
    </li>
  )
}

export default function Progress() {
  const [searchParams] = useSearchParams()
  const queryRoadmapId = searchParams.get('roadmapId')

  const [roadmaps, setRoadmaps] = useState([])
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(queryRoadmapId || '')
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [updatingStep, setUpdatingStep] = useState(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState(null)

  // Load roadmaps list
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRoadmaps()
        // getRoadmaps returns { items, meta } — extract the array
        const list = data?.items ?? data ?? []
        setRoadmaps(list)
        if (!selectedRoadmapId && list.length > 0) {
          setSelectedRoadmapId(list[0].id)
        }
      } catch {
        toast.error('Failed to load roadmaps.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load progress when selected roadmap changes
  useEffect(() => {
    if (!selectedRoadmapId) {
      setProgress(null)
      return
    }

    const fetch = async () => {
      setError(null)
      setProgress(null)
      try {
        const data = await getProgressByRoadmap(selectedRoadmapId)
        setProgress(data)
      } catch {
        // No tracker yet — user needs to initialize
        setProgress(null)
      }
    }

    fetch()
  }, [selectedRoadmapId])

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      const data = await initializeProgress(selectedRoadmapId)
      setProgress(data)
      toast.success('Progress tracker initialized.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleToggle = async (stepOrder, completed) => {
    setUpdatingStep(stepOrder)
    try {
      const updated = await updateMilestone(selectedRoadmapId, stepOrder, completed)
      setProgress(updated)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingStep(null)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const updated = await resetProgress(selectedRoadmapId)
      setProgress(updated)
      setShowResetDialog(false)
      toast.success('Progress reset.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsResetting(false)
    }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading…" />
      </section>
    )
  }

  const selectedRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId)

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Tracking"
          title="Progress"
          description="Track which roadmap steps you've completed and monitor your overall progress."
        />

        {roadmaps.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No roadmaps yet"
            description="Generate a roadmap first before tracking progress."
            action={<Button to="/roadmap">Go to Roadmaps</Button>}
          />
        ) : (
          <div className="space-y-6">
            {/* Roadmap selector */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Select roadmap</span>
                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                  value={selectedRoadmapId}
                  onChange={(e) => setSelectedRoadmapId(e.target.value)}
                >
                  {roadmaps.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.goalTitle} — {r.targetRole}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? <ErrorMessage title="Error" message={error} /> : null}

            {/* No tracker yet */}
            {!progress ? (
              <div className="glass-panel rounded-3xl px-6 py-12 text-center space-y-4">
                <TrendingUp className="mx-auto h-10 w-10 text-slate-500" />
                <p className="text-white font-semibold">No tracker for this roadmap yet</p>
                <p className="text-sm text-slate-400">
                  Initialize a tracker to start marking steps as complete.
                </p>
                <Button onClick={handleInitialize} isLoading={isInitializing}>
                  Initialize tracker
                </Button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Progress"
                    value={`${progress.progressPercentage}%`}
                    icon={TrendingUp}
                    accent={
                      progress.progressPercentage >= 75
                        ? 'text-emerald-400'
                        : progress.progressPercentage >= 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                    }
                  />
                  <StatCard
                    label="Completed"
                    value={`${progress.completedSteps} / ${progress.totalSteps}`}
                    icon={CheckCircle2}
                    accent="text-emerald-400"
                  />
                  <StatCard
                    label="Status"
                    value={progress.status.replace('_', ' ')}
                    icon={TrendingUp}
                    accent="text-brand-400"
                  />
                </div>

                {/* Progress bar */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">Overall completion</p>
                    <span className="text-sm font-semibold text-white">
                      {progress.progressPercentage}%
                    </span>
                  </div>
                  <ProgressBar percentage={progress.progressPercentage} />
                </div>

                {/* Milestones */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white">Steps</p>
                    <Button
                      variant="ghost"
                      onClick={() => setShowResetDialog(true)}
                      className="text-xs text-slate-400"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  </div>
                  <ul className="divide-y divide-white/5">
                    {progress.milestones.map((m) => (
                      <MilestoneItem
                        key={m.stepOrder}
                        milestone={m}
                        onToggle={handleToggle}
                        isUpdating={updatingStep === m.stepOrder}
                      />
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={showResetDialog}
        title="Reset progress?"
        description="All completed steps will be marked as incomplete. This cannot be undone."
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
        isLoading={isResetting}
      />
    </section>
  )
}
