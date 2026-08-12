import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, isLoading = false }) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="glass-panel relative z-10 w-full max-w-sm rounded-3xl p-6"
          >
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onConfirm}
                isLoading={isLoading}
                className="bg-rose-600 hover:bg-rose-500"
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
