import { cn } from '../../utils/cn'

/**
 * Generic filter/sort select — small inline dropdown.
 */
export function FilterSelect({ value, onChange, options, placeholder = 'All', className }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-brand-400',
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

/**
 * Sort direction toggle button.
 */
export function SortOrderToggle({ sortOrder, onChange }) {
  return (
    <button
      onClick={() => onChange(sortOrder === 'asc' ? 'desc' : 'asc')}
      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 transition hover:border-brand-400/50 hover:text-white"
      title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
    >
      {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
    </button>
  )
}
