'use client'

import { FIELD_LABELS } from '@/lib/fields/labels'
import type { Achievement } from '@/payload-types'

export type AchievementFiltersValue = {
  year: 'all' | number
  exam: 'all' | string
  awardLevel: 'all' | Achievement['awardLevel']
}

type AchievementFiltersProps = {
  exams: string[]
  value: AchievementFiltersValue
  years: number[]
  onChange: (value: AchievementFiltersValue) => void
}

const awardLevels: { value: Achievement['awardLevel']; label: string }[] = [
  { value: 'nhat', label: FIELD_LABELS.achievements.first },
  { value: 'nhi', label: FIELD_LABELS.achievements.second },
  { value: 'ba', label: FIELD_LABELS.achievements.third },
  { value: 'khuyen-khich', label: FIELD_LABELS.achievements.consolation },
  { value: 'giai-khac', label: FIELD_LABELS.achievements.other },
]

export function AchievementFilters({
  exams,
  value,
  years,
  onChange,
}: AchievementFiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {FIELD_LABELS.achievements.filterYear}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({
              ...value,
              year: event.target.value === 'all' ? 'all' : Number(event.target.value),
            })
          }
          value={value.year}
        >
          <option value="all">{FIELD_LABELS.achievements.filterAll}</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {FIELD_LABELS.achievements.filterExam}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({
              ...value,
              exam: event.target.value === 'all' ? 'all' : event.target.value,
            })
          }
          value={value.exam}
        >
          <option value="all">{FIELD_LABELS.achievements.filterAll}</option>
          {exams.map((exam) => (
            <option key={exam} value={exam}>{exam}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {FIELD_LABELS.achievements.filterAwardLevel}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({
              ...value,
              awardLevel: event.target.value as AchievementFiltersValue['awardLevel'],
            })
          }
          value={value.awardLevel}
        >
          <option value="all">{FIELD_LABELS.achievements.filterAll}</option>
          {awardLevels.map((level) => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
