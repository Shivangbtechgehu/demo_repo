import { cn } from '../../utils/cn'

export default function Input({ label, error, className, id, ...props }) {
  const inputId = id || props.name

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-slate-200">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40',
          error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/30',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </label>
  )
}
