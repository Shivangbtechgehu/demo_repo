export default function StatCard({ label, value, icon: Icon, accent = 'text-brand-400' }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon ? <Icon className={`h-5 w-5 ${accent}`} /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
