import { APP_NAME } from '../../constants'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-sm text-slate-400">
      <div className="page-shell flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p>Built with React, Vite, and Tailwind CSS.</p>
      </div>
    </footer>
  )
}
