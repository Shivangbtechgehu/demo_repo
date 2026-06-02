import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] place-items-center py-16 text-center">
      <div className="space-y-6">
        <p className="text-6xl font-semibold text-white sm:text-7xl">404</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Page not found</h1>
          <p className="max-w-lg text-slate-300">The route you requested does not exist or was moved.</p>
        </div>
        <Button to="/">Back to home</Button>
      </div>
    </section>
  )
}
