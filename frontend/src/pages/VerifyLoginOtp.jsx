import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function VerifyLoginOtp() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = location.state?.email || ''
  const from = location.state?.from || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: { email: prefillEmail, otp: '' },
  })

  const onSubmit = async (values) => {
    try {
      await auth.verifyLoginOtp(values)
      navigate(from, { replace: true })
    } catch (error) {
      setError('root', { message: error.message || 'OTP verification failed.' })
    }
  }

  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] place-items-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-brand-400" />
            <h1 className="text-2xl font-semibold text-white">Confirm login</h1>
          </div>
          <p className="text-sm text-slate-300">
            Enter the 6-digit OTP sent to{' '}
            <span className="font-medium text-white">{prefillEmail || 'your email'}</span>.
            It expires in 10 minutes.
          </p>
        </div>

        {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {!prefillEmail ? (
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required.' })}
            />
          ) : (
            <input type="hidden" {...register('email')} />
          )}

          <Input
            label="OTP"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            error={errors.otp?.message}
            {...register('otp', {
              required: 'OTP is required.',
              pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits.' },
            })}
          />

          <Button type="submit" className="w-full" isLoading={auth.isLoading}>
            Verify &amp; Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Wrong account?{' '}
          <Link to="/login" className="text-brand-300 hover:text-brand-200">
            Back to login
          </Link>
        </p>
      </motion.div>
    </section>
  )
}
