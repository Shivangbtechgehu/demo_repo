import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Plus, ChevronDown, ChevronUp, Calendar, Layers, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import { FilterSelect, SortOrderToggle } from '../components/ui/FilterControls'
import { useListQuery } from '../hooks/useListQuery'
import RoadmapReviews from '../components/ui/RoadmapReviews'
import { getGoals } from '../services/careerGoalService'
import { getRoadmaps, generateRoadmap } from '../services/roadmapService'
import { cn } from '../utils/cn'

const STATUS_COLORS = {
  active: 'text-emerald-300 bg-emerald-400/10',
  draft: 'text-amber-300 bg-amber-400/10',
  completed: 'text-brand-300 bg-brand-400/10',
}

function RoadmapCard({ roadmap, onTrack }) {
  const [expanded, setExpanded]       = useState(false)
  const [showReviews, setShowReviews] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl overflow-hidden"
    >
      {/* Card header */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-white">
              {roadmap.roadmapTitle || roadmap.goalTitle}
            </p>
            <p className="mt-0.5 text-sm text-slate-400">{roadmap.targetRole}</p>
            {roadmap.estimatedDuration ? (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand-300">
                <Calendar className="h-3 w-3" />
                {roadmap.estimatedDuration} estimated
              </span>
            ) : null}
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-0.5 text-xs font-medium capitalize',
              STATUS_COLORS[roadmap.status] || STATUS_COLORS.active,
            )}
          >
            {roadmap.status}
          </span>
        </div>

        {roadmap.overview ? (
          <p className="mt-3 text-sm text-slate-400">{roadmap.overview}</p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-white">{roadmap.steps.length}</p>
            <p className="text-xs text-slate-400">Steps</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-white">{roadmap.totalEstimatedDays}</p>
            <p className="text-xs text-slate-400">Est. days</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-white">{roadmap.sourceMissingSkills.length}</p>
            <p className="text-xs text-slate-400">Skills to learn</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => setExpanded((v) => !v)}
            className="gap-1.5"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? 'Hide steps' : 'View steps'}
          </Button>
          <Button onClick={() => onTrack(roadmap.id)} variant="primary">
            Track progress
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowReviews((v) => !v)}
            className="gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            {showReviews ? 'Hide reviews' : 'Mentor reviews'}
          </Button>
        </div>
      </div>

      {/* Steps list */}
      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <ol className="divide-y divide-white/5">
              {roadmap.steps.map((step) => (
                <li key={step.order} className="flex gap-4 px-6 py-4 sm:px-8">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
                    {step.order}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-white">{step.title}</p>
                    {step.description ? (
                      <p className="mt-0.5 text-sm text-slate-400">{step.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.estimatedDays > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" /> {step.estimatedDays} day{step.estimatedDays !== 1 ? 's' : ''}
                        </span>
                      ) : null}
                      {step.resources?.map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mentor reviews panel */}
      <AnimatePresence>
        {showReviews ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 px-6 py-5 sm:px-8"
          >
            <p className="mb-4 text-sm font-semibold text-white">Mentor Reviews</p>
            <RoadmapReviews roadmapId={roadmap.id} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Roadmap() {
  const navigate = useNavigate()

  const fetchRoadmaps = useCallback((p) => getRoadmaps(p), [])
  const { items: roadmaps, meta, loading, params, setSearch, setFilter, setSortBy, setSortOrder, setPage, refresh } = useListQuery(fetchRoadmaps, { limit: 10 })

  const [goals, setGoals]             = useState([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError]        = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)

  useEffect(() => {
    getGoals().then((d) => {
      const list = d?.items ?? d ?? []
      setGoals(list)
      if (list.length > 0) setSelectedGoalId(list[0].id)
    }).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!selectedGoalId) return
    setIsGenerating(true)
    setGenError(null)
    try {
      await generateRoadmap(selectedGoalId)
      setShowGenerator(false)
      toast.success('Roadmap generated.')
      refresh()
    } catch (err) {
      setGenError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTrack = (roadmapId) => {
    navigate(`/progress?roadmapId=${roadmapId}`)
  }

  const totalDays = roadmaps.reduce((sum, r) => sum + (r.totalEstimatedDays || 0), 0)

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading roadmaps…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Learning Plan"
          title="Roadmaps"
          description="Generate a step-by-step learning plan from any career goal. Each step targets a missing skill."
          action={
            <Button onClick={() => setShowGenerator((v) => !v)}>
              <Plus className="h-4 w-4" /> Generate roadmap
            </Button>
          }
        />

        {/* Generator panel */}
        <AnimatePresence>
          {showGenerator ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4"
            >
              <p className="font-semibold text-white">Generate a new roadmap</p>

              {goals.length === 0 ? (
                <p className="text-sm text-slate-400">
                  You have no career goals yet.{' '}
                  <a href="/goals" className="text-brand-300 underline">
                    Create one first.
                  </a>
                </p>
              ) : (
                <>
                  {genError ? <ErrorMessage title="Generation failed" message={genError} /> : null}
                  <div className="flex flex-wrap items-end gap-4">
                    <label className="flex-1 min-w-[200px] space-y-2">
                      <span className="text-sm font-medium text-slate-200">Select goal</span>
                      <select
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                      >
                        {goals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setShowGenerator(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerate} isLoading={isGenerating}>
                        Generate
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Search + filter toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={params.search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search roadmaps…"
            className="min-w-[200px]"
          />
          <FilterSelect
            value={params.status || ''}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: 'active',    label: 'Active'    },
              { value: 'draft',     label: 'Draft'     },
              { value: 'completed', label: 'Completed' },
            ]}
            placeholder="All statuses"
          />
          <FilterSelect
            value={params.sortBy}
            onChange={setSortBy}
            options={[
              { value: 'createdAt',          label: 'Created'    },
              { value: 'goalTitle',          label: 'Goal'       },
              { value: 'totalEstimatedDays', label: 'Est. Days'  },
            ]}
            placeholder="Sort by"
          />
          <SortOrderToggle sortOrder={params.sortOrder} onChange={setSortOrder} />
        </div>

        {/* Stats */}
        {roadmaps.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total roadmaps" value={roadmaps.length} icon={Map} />
            <StatCard label="Total steps" value={roadmaps.reduce((s, r) => s + r.steps.length, 0)} icon={Layers} />
            <StatCard label="Est. total days" value={totalDays} icon={Calendar} accent="text-amber-400" />
          </div>
        ) : null}

        {/* Roadmaps list */}
        {roadmaps.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No roadmaps yet"
            description="Generate your first roadmap from a career goal. Make sure you've run gap analysis first."
            action={
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="h-4 w-4" /> Generate roadmap
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {roadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} onTrack={handleTrack} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={setPage} />
      </motion.div>
    </section>
  )
}
