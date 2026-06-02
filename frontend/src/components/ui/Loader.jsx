export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 text-slate-200">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
