import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Loader from '../components/ui/Loader'
import PageHeader from '../components/ui/PageHeader'
import { getMyProfile, upsertProfile } from '../services/profileService'

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      fullName: '',
      education: '',
      bio: '',
      targetRole: '',
      currentSkillsRaw: '',
      interestsRaw: '',
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getMyProfile()
        reset({
          fullName: profile.fullName || '',
          education: profile.education || '',
          bio: profile.bio || '',
          targetRole: profile.targetRole || '',
          currentSkillsRaw: (profile.currentSkills || []).join(', '),
          interestsRaw: (profile.interests || []).join(', '),
        })
      } catch (err) {
        // 404 is expected when profile doesn't exist yet — stay on blank form
        if (!err?.message?.includes('404') && !err?.message?.includes('not found')) {
          setPageError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const payload = {
        fullName: values.fullName,
        education: values.education,
        bio: values.bio,
        targetRole: values.targetRole,
        currentSkills: values.currentSkillsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interests: values.interestsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      await upsertProfile(payload)
      toast.success('Profile saved.')
    } catch (err) {
      setError('root', { message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading profile…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          eyebrow="Account"
          title="Your Profile"
          description="Keep your profile up-to-date so the gap analysis and roadmap engine have accurate data."
        />

        {pageError ? <ErrorMessage className="mt-6" title="Failed to load profile" message={pageError} /> : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 text-slate-200">
              <User className="h-5 w-5 text-brand-400" />
              <span className="font-medium">Basic info</span>
            </div>

            {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

            <Input
              label="Full name"
              placeholder="Jane Doe"
              error={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required.' })}
            />
            <Input
              label="Target role"
              placeholder="e.g. Full-Stack Developer"
              error={errors.targetRole?.message}
              {...register('targetRole', { required: 'Target role is required.' })}
            />
            <Input
              label="Education"
              placeholder="e.g. B.Sc. Computer Science"
              error={errors.education?.message}
              {...register('education', { required: 'Education is required.' })}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Bio</span>
              <textarea
                rows={3}
                placeholder="A short intro about yourself…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
                {...register('bio')}
              />
            </label>
          </div>

          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
            <p className="font-medium text-slate-200">Skills &amp; Interests</p>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Current skills</span>
              <textarea
                rows={4}
                placeholder="React, Node.js, MongoDB, …  (comma-separated)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
                {...register('currentSkillsRaw')}
              />
              <p className="text-xs text-slate-500">Separate each skill with a comma.</p>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Interests</span>
              <textarea
                rows={3}
                placeholder="Web development, AI, Open source, …  (comma-separated)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
                {...register('interestsRaw')}
              />
            </label>

            <Button type="submit" isLoading={saving} className="w-full mt-2">
              Save profile
            </Button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}
