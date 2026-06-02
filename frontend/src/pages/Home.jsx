import { ArrowRight, Shield, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

export default function Home() {
  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] items-center py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <Sparkles className="h-4 w-4 text-brand-400" />
            Production-ready React starter
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              A modular frontend foundation built for real products.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              React 19, Vite, Tailwind, routing, auth protection, reusable UI, and a clean service layer are all wired together.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/register">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/dashboard" variant="secondary">
              <Shield className="h-4 w-4" />
              Open dashboard
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel rounded-3xl p-6 sm:p-8"
        >
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Included architecture</p>
            <div className="grid gap-3 text-sm text-slate-200">
              <div className="rounded-2xl bg-white/5 p-4">Router-driven page organization</div>
              <div className="rounded-2xl bg-white/5 p-4">Centralized API client with interceptors</div>
              <div className="rounded-2xl bg-white/5 p-4">Protected dashboard route</div>
              <div className="rounded-2xl bg-white/5 p-4">Accessible reusable inputs and buttons</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
