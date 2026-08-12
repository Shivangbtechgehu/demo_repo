import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  className,
}) {
  return (
    <div className={cn('relative flex-1', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
      />
      {value ? (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
