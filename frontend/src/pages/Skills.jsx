import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus, Pencil, Link2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorMessage from '../components/ui/ErrorMessage'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'
import { FilterSelect, SortOrderToggle } from '../components/ui/FilterControls'
import { useListQuery } from '../hooks/useListQuery'
import { getSkills, addSkill, updateSkill, mapSkillToGoal } from '../services/skillService'
import { getGoals } from '../services/careerGoalService'
import { cn } from '../utils/cn'

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']

const PROFICIENCY_COLORS = {
  beginner: 'text-slate-400 bg-slate-400/10',
  intermediate: 'text-amber-300 bg-amber-400/10',
  advanced: 'text-brand-300 bg-brand-400/10',
  expert: 'text-emerald-300 bg-emerald-400/10',
}

function SkillForm({ initial, onSave, onCancel, isSaving }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      name: initial?.name || '',
      category: initial?.category || '',
      proficiencyLevel: initial?.proficiencyLevel || 'beginner',
      notes: initial?.notes || '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await onSave(values)
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root ? <ErrorMessage message={errors.root.message} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Skill name"
          placeholder="e.g. React"
          error={errors.name?.message}
          {...register('name', { required: 'Skill name is required.' })}
        />
        <Input
          label="Category"
          placeholder="e.g. Frontend, Database…"
          error={errors.category?.message}
          {...register('category')}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Proficiency level</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
          {...register('proficiencyLevel')}
        >
          {PROFICIENCY_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Notes</span>
        <textarea
          rows={2}
          placeholder="Any extra notes…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 resize-none"
          {...register('notes')}
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {initial ? 'Save changes' : 'Add skill'}
        </Button>
      </div>
    </form>
  )
}

function MapGoalModal({ skill, goals, onMap, onClose, isMapping }) {
  const [selectedGoalId, setSelectedGoalId] = useState('')

  const alreadyMapped = skill.mappedGoalIds || []
  const unmappedGoals = goals.filter((g) => !alreadyMapped.includes(g.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="glass-panel relative z-10 w-full max-w-sm rounded-3xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-white">Map "{skill.name}" to a goal</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {unmappedGoals.length === 0 ? (
          <p className="text-sm text-slate-400">This skill is already mapped to all your goals.</p>
        ) : (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Select goal</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
              >
                <option value="">— choose a goal —</option>
                {unmappedGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={isMapping}>
                Cancel
              </Button>
              <Button
                onClick={() => onMap(skill.id, selectedGoalId)}
                isLoading={isMapping}
                disabled={!selectedGoalId}
              >
                Map skill
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function Skills() {
  const fetchSkills = useCallback((p) => getSkills(p), [])
  const { items: skills, meta, loading, params, setSearch, setFilter, setSortBy, setSortOrder, setPage, refresh } = useListQuery(fetchSkills, { limit: 12 })

  const [goals, setGoals]           = useState([])
  const [showForm, setShowForm]      = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [mappingSkill, setMappingSkill] = useState(null)
  const [isSaving, setIsSaving]      = useState(false)
  const [isMapping, setIsMapping]    = useState(false)

  useEffect(() => {
    getGoals().then((d) => setGoals(d.items || [])).catch(() => {})
  }, [])
  const handleAdd = async (values) => {
    setIsSaving(true)
    try {
      await addSkill(values)
      setShowForm(false)
      toast.success('Skill added.')
      refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (values) => {
    setIsSaving(true)
    try {
      await updateSkill(editingSkill.id, values)
      setEditingSkill(null)
      toast.success('Skill updated.')
      refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const handleMap = async (skillId, goalId) => {
    setIsMapping(true)
    try {
      await mapSkillToGoal(skillId, goalId)
      setMappingSkill(null)
      toast.success('Skill mapped to goal.')
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsMapping(false)
    }
  }

  if (loading) {
    return (
      <section className="page-shell py-12">
        <Loader label="Loading skills…" />
      </section>
    )
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader
          eyebrow="Skills"
          title="My Skills"
          description="Add your current skills and map them to career goals to power the gap analysis."
          action={
            !showForm && !editingSkill ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add skill
              </Button>
            ) : null
          }
        />

        {/* Add form */}
        <AnimatePresence>
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold text-white">Add new skill</p>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SkillForm onSave={handleAdd} onCancel={() => setShowForm(false)} isSaving={isSaving} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Edit form */}
        <AnimatePresence>
          {editingSkill ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold text-white">Edit skill</p>
                <button
                  onClick={() => setEditingSkill(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SkillForm
                initial={editingSkill}
                onSave={handleUpdate}
                onCancel={() => setEditingSkill(null)}
                isSaving={isSaving}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Search + filter toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={params.search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search skills…"
            className="min-w-[200px]"
          />
          <FilterSelect
            value={params.proficiencyLevel || ''}
            onChange={(v) => setFilter('proficiencyLevel', v)}
            options={[
              { value: 'beginner',     label: 'Beginner'     },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced',     label: 'Advanced'     },
              { value: 'expert',       label: 'Expert'       },
            ]}
            placeholder="All levels"
          />
          <FilterSelect
            value={params.sortBy}
            onChange={setSortBy}
            options={[
              { value: 'createdAt',       label: 'Created'     },
              { value: 'name',            label: 'Name'        },
              { value: 'proficiencyLevel', label: 'Proficiency' },
            ]}
            placeholder="Sort by"
          />
          <SortOrderToggle sortOrder={params.sortOrder} onChange={setSortOrder} />
        </div>

        {/* Skills grid */}
        {skills.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No skills yet"
            description="Add your first skill to start building your gap analysis."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> Add skill
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-3xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{skill.name}</p>
                    {skill.category ? (
                      <p className="mt-0.5 text-sm text-slate-400 truncate">{skill.category}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditingSkill(skill)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                      aria-label="Edit skill"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setMappingSkill(skill)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-500/10 hover:text-brand-300 transition"
                      aria-label="Map to goal"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                      PROFICIENCY_COLORS[skill.proficiencyLevel] || PROFICIENCY_COLORS.beginner,
                    )}
                  >
                    {skill.proficiencyLevel}
                  </span>
                  {skill.mappedGoalIds?.length > 0 ? (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-brand-300 bg-brand-400/10">
                      {skill.mappedGoalIds.length} goal{skill.mappedGoalIds.length > 1 ? 's' : ''} mapped
                    </span>
                  ) : null}
                </div>

                {skill.notes ? (
                  <p className="text-xs text-slate-500 line-clamp-2">{skill.notes}</p>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination meta={meta} onPageChange={setPage} />
      </motion.div>

      {/* Map to goal modal */}
      <AnimatePresence>
        {mappingSkill ? (
          <MapGoalModal
            skill={mappingSkill}
            goals={goals}
            onMap={handleMap}
            onClose={() => setMappingSkill(null)}
            isMapping={isMapping}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
