import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      await auth.login(values)
      toast.success('OTP sent to your email!')
      // Pass email + intended destination via state
      navigate('/verify-login-otp', { state: { email: values.email, from } })
    } catch (error) {
      setError('root', { message: error.message || 'Unable to log in.' })
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
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-slate-300">
            We'll send a 6-digit OTP to your email to confirm it's you.
          </p>
        </div>

        {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required.' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required.' })}
          />
          <Button type="submit" className="w-full" isLoading={auth.isLoading}>
            Send OTP
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-300 hover:text-brand-200">
            Create one
          </Link>
        </p>
      </motion.div>
    </section>
  )
}
