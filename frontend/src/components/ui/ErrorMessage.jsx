export default function ErrorMessage({ title = 'Something went wrong', message }) {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-1 text-sm text-rose-100/90">{message}</p> : null}
    </div>
  )
}
