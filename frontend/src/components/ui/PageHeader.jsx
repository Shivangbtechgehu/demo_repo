export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-semibold text-white">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
