import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Button({
  children,
  className,
  isLoading = false,
  variant = 'primary',
  type = 'button',
  to,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-400',
    secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
    ghost: 'text-slate-200 hover:bg-white/10',
  }

  const content = (
    <>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, variants[variant], className)} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={cn(baseClasses, variants[variant], className)} disabled={isLoading || props.disabled} {...props}>
      {content}
    </button>
  )
}
