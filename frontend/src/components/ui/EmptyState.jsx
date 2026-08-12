export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
      {Icon ? <Icon className="mb-4 h-10 w-10 text-slate-500" /> : null}
      <p className="text-lg font-semibold text-white">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
