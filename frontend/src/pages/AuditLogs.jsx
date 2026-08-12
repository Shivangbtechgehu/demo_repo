import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import { FilterSelect, SortOrderToggle } from '../components/ui/FilterControls'
import { useListQuery } from '../hooks/useListQuery'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../services/apiClient'

const RESOURCE_TYPES = [
  'User','Profile','CareerGoal','Skill','GapAnalysis',
  'Roadmap','Progress','MentorReview','Project','Notification',
]

const fetchAuditLogs = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search)       query.append('action',       params.search)
  if (params.resourceType) query.append('resourceType', params.resourceType)
  if (params.fromDate)     query.append('fromDate',     params.fromDate)
  if (params.toDate)       query.append('toDate',       params.toDate)
  if (params.sortBy)       query.append('sortBy',       params.sortBy)
  if (params.sortOrder)    query.append('sortOrder',    params.sortOrder)
  if (params.page)         query.append('page',         params.page)
  if (params.limit)        query.append('limit',        params.limit)

  const res = await apiClient.get(`/v1/audit-logs?${query.toString()}`)
  return { items: res.data.data.logs, meta: res.data.meta }
}

export default function AuditLogs() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const fetch = useCallback((p) => fetchAuditLogs(p), [])
  const {
    items: logs, meta, loading, params,
    setSearch, setFilter, setSortBy, setSortOrder, setPage,
  } = useListQuery(fetch, { limit: 20, sortBy: 'timestamp', sortOrder: 'desc' })

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading audit logs…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <PageHeader
          eyebrow="Admin"
          title="Audit Logs"
          description="Immutable record of all platform activity."
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={params.search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Filter by action…"
            className="min-w-[200px]"
          />
          <FilterSelect
            value={params.resourceType || ''}
            onChange={(v) => setFilter('resourceType', v)}
            options={RESOURCE_TYPES.map((r) => ({ value: r, label: r }))}
            placeholder="All resources"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            From
            <input
              type="date"
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-400"
              onChange={(e) => setFilter('fromDate', e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            To
            <input
              type="date"
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-400"
              onChange={(e) => setFilter('toDate', e.target.value)}
            />
          </label>
          <FilterSelect
            value={params.sortBy}
            onChange={setSortBy}
            options={[
              { value: 'timestamp',    label: 'Time'     },
              { value: 'action',       label: 'Action'   },
              { value: 'resourceType', label: 'Resource' },
            ]}
            placeholder="Sort by"
          />
          <SortOrderToggle sortOrder={params.sortOrder} onChange={setSortOrder} />
        </div>

        {/* Table */}
        {logs.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No audit logs found" description="Try adjusting your filters." />
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Action</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Resource</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Resource ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Actor Role</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id || log._id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3 font-mono text-xs text-brand-300">{log.action}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{log.resourceType}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[140px] truncate">{log.resourceId || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-400/10 px-2 py-0.5 text-xs capitalize text-slate-300">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </motion.div>
    </section>
  )
}
