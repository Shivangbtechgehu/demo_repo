import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, Map, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import StatCard from '../components/ui/StatCard'
import Loader from '../components/ui/Loader'
import { getGoals } from '../services/careerGoalService'
import { getSkills } from '../services/skillService'
import { getRoadmaps } from '../services/roadmapService'
import { getAllProgress } from '../services/progressService'

const QUICK_LINKS = [
  { label: 'Manage profile', description: 'Update your skills & bio', to: '/profile', icon: TrendingUp },
  { label: 'Career goals', description: 'Create & track goals', to: '/goals', icon: Target },
  { label: 'Skills', description: 'Add and map your skills', to: '/skills', icon: Zap },
  { label: 'Gap analysis', description: 'See what skills you need', to: '/gap-analysis', icon: TrendingUp },
  { label: 'Roadmaps', description: 'Generate a learning plan', to: '/roadmap', icon: Map },
  { label: 'Progress', description: 'Track milestones', to: '/progress', icon: TrendingUp },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [goals, skills, roadmaps, progress] = await Promise.allSettled([
          getGoals(),
          getSkills(),
          getRoadmaps(),
          getAllProgress(),
        ])

        // All list services return { items, meta } — extract counts safely
        const count = (result) => {
          if (result.status !== 'fulfilled') return 0
          const v = result.value
          return v?.items?.length ?? v?.length ?? 0
        }

        const progressList =
          progress.status === 'fulfilled'
            ? progress.value?.items ?? progress.value ?? []
            : []

        const avgProgress =
          progressList.length > 0
            ? Math.round(
                progressList.reduce((s, p) => s + p.progressPercentage, 0) /
                  progressList.length,
              )
            : 0

        setStats({
          goals:       count(goals),
          skills:      count(skills),
          roadmaps:    count(roadmaps),
          avgProgress,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Welcome */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Here's a snapshot of your career progress.
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <Loader label="Loading stats…" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Career Goals" value={stats.goals} icon={Target} />
            <StatCard label="Skills" value={stats.skills} icon={Zap} accent="text-amber-400" />
            <StatCard label="Roadmaps" value={stats.roadmaps} icon={Map} accent="text-emerald-400" />
            <StatCard
              label="Avg Progress"
              value={`${stats.avgProgress}%`}
              icon={TrendingUp}
              accent="text-brand-400"
            />
          </div>
        )}

        {/* Quick links */}
        <div>
          <p className="mb-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Quick access</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map(({ label, description, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group glass-panel flex items-center justify-between gap-4 rounded-2xl p-4 transition hover:border-brand-400/30 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
                    <Icon className="h-4 w-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-brand-400" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
