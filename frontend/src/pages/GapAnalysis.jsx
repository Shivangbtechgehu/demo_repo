import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageHeader from '../components/ui/PageHeader'
import { getGoals } from '../services/careerGoalService'
import { generateGapAnalysis, getGapAnalysis } from '../services/gapAnalysisService'
import { cn } from '../utils/cn'

function ProgressRing({ percentage }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const color =
    percentage >= 75
      ? 'stroke-emerald-400'
      : percentage >= 40
        ? 'stroke-amber-400'
        : 'stroke-rose-400'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700', color)}
        />
      </svg>
      <span className="absolute text-xl font-bold text-white">{percentage}%</span>
    </div>
  )
}

function AnalysisCard({ analysis, onRegenerate, isGenerating }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Analysis for</p>
          <p className="mt-1 text-xl font-semibold text-white">{analysis.goalTitle}</p>
          <p className="text-sm text-slate-400">{analysis.targetRole}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ProgressRing percentage={analysis.completionPercentage} />
          <p className="text-xs text-slate-400">Skill match</p>
        </div>
      </div>

      {/* Skill columns */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Matched */}
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-400/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              Matched skills ({analysis.matchedSkills.length})
            </span>
          </div>
          {analysis.matchedSkills.length === 0 ? (
            <p className="text-xs text-slate-500">None yet — add skills to your profile.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {analysis.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing */}
        <div className="rounded-2xl bg-rose-500/5 border border-rose-400/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-300">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Missing skills ({analysis.missingSkills.length})
            </span>
          </div>
          {analysis.missingSkills.length === 0 ? (
            <p className="text-xs text-slate-500">No gaps — you're fully matched!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-rose-400/10 px-2.5 py-0.5 text-xs font-medium text-rose-300"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <Button variant="secondary" onClick={onRegenerate} isLoading={isGenerating}>
          <RefreshCw className="h-4 w-4" /> Re-run analysis
        </Button>
      </div>
    </motion.div>
  )
}

export default function GapAnalysis() {
  const [goals, setGoals] = useState([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getGoals()
        // getGoals returns { items, meta } — extract the array
        const goalList = data?.items ?? data ?? []
        setGoals(goalList)
        if (goalList.length > 0) {
          setSelectedGoalId(goalList[0].id)
        }
      } catch {
        toast.error('Failed to load goals.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Auto-fetch existing analysis when selected goal changes
  useEffect(() => {
    if (!selectedGoalId) {
      setAnalysis(null)
      return
    }

    const fetch = async () => {
      setIsFetching(true)
      setError(null)
      setAnalysis(null)
      try {
        const data = await getGapAnalysis(selectedGoalId)
        setAnalysis(data)
      } catch {
        // No existing analysis — that's fine, user can generate one
        setAnalysis(null)
      } finally {
        setIsFetching(false)
      }
    }

    fetch()
  }, [selectedGoalId])

  const handleGenerate = async () => {
    if (!selectedGoalId) return
    setIsGenerating(true)
    setError(null)
    try {
      const data = await generateGapAnalysis(selectedGoalId)
      setAnalysis(data)
      toast.success('Gap analysis complete.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Analysis"
          title="Gap Analysis"
          description="Compare your current skills against what a goal requires and see exactly what's missing."
        />

        {goals.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No career goals yet"
            description="Create a career goal first, then map required skills to it before running the analysis."
            action={<Button to="/goals">Go to Career Goals</Button>}
          />
        ) : (
          <div className="space-y-6">
            {/* Goal selector + trigger */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex-1 min-w-[200px] space-y-2">
                  <span className="text-sm font-medium text-slate-200">Select a career goal</span>
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
                <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!selectedGoalId}>
                  <BarChart2 className="h-4 w-4" />
                  {analysis ? 'Re-run analysis' : 'Run analysis'}
                </Button>
              </div>
            </div>

            {error ? <ErrorMessage title="Analysis failed" message={error} /> : null}

            {isFetching ? (
              <Loader label="Loading analysis…" />
            ) : analysis ? (
              <AnalysisCard
                analysis={analysis}
                onRegenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center">
                <BarChart2 className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                <p className="text-slate-400 text-sm">
                  No analysis yet for this goal. Click <strong className="text-white">Run analysis</strong> to generate one.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  )
}
