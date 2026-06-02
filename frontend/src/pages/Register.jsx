import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const auth = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await auth.register(values)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError('root', { message: error.message || 'Unable to register.' })
    }
  }

  return (
    <section className="page-shell grid min-h-[calc(100vh-8rem)] place-items-center py-16">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold text-white">Create account</h1>
          <p className="text-sm text-slate-300">This starter uses a mock auth flow so you can wire a real backend later without changing the UI.</p>
        </div>

        {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Name"
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required.' })}
          />
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
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account? <Link to="/login" className="text-brand-300 hover:text-brand-200">Sign in</Link>
        </p>
      </motion.div>
    </section>
  )
}
