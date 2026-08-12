import { useEffect, useState } from 'react'
import { MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Loader from './Loader'
import { getReviewsByRoadmap } from '../../services/mentorReviewService'
import { cn } from '../../utils/cn'

const STATUS_CONFIG = {
  pending:  { icon: Clock,         color: 'text-amber-300 bg-amber-400/10',   label: 'Pending'  },
  approved: { icon: CheckCircle2,  color: 'text-emerald-300 bg-emerald-400/10', label: 'Approved' },
  rejected: { icon: XCircle,       color: 'text-rose-300 bg-rose-400/10',     label: 'Rejected' },
}

export default function RoadmapReviews({ roadmapId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roadmapId) return
    const load = async () => {
      try {
        const data = await getReviewsByRoadmap(roadmapId)
        setReviews(data || [])
      } catch {
        // silent — reviews are supplementary
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [roadmapId])

  if (loading) return <Loader label="Loading reviews…" />

  if (reviews.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-400">
        <MessageSquare className="h-4 w-4 shrink-0" />
        No mentor reviews yet for this roadmap.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const cfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending
        const StatusIcon = cfg.icon
        return (
          <div key={review.id} className="glass-panel rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
                  {review.mentor?.name?.[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{review.mentor?.name || 'Mentor'}</p>
                  <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.color)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>
          </div>
        )
      })}
    </div>
  )
}
