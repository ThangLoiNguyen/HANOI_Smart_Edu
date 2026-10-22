'use client'

import { useMemo, useState } from 'react'

import { AchievementCard } from '@/components/achievements/achievement-card'
import {
  AchievementFilters,
  type AchievementFiltersValue,
} from '@/components/achievements/achievement-filters'
import { FIELD_LABELS } from '@/lib/fields/labels'
import type { Achievement } from '@/payload-types'

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const [filters, setFilters] = useState<AchievementFiltersValue>({
    year: 'all',
    exam: 'all',
    awardLevel: 'all',
  })

  const years = useMemo(
    () => [...new Set(achievements.map(({ year }) => year))].sort((a, b) => b - a),
    [achievements],
  )
  const exams = useMemo(
    () => [...new Set(achievements.map(({ examName }) => examName))].sort((a, b) => a.localeCompare(b, 'vi')),
    [achievements],
  )
  const filteredAchievements = useMemo(
    () =>
      achievements.filter(
        (achievement) =>
          (filters.year === 'all' || achievement.year === filters.year) &&
          (filters.exam === 'all' || achievement.examName === filters.exam) &&
          (filters.awardLevel === 'all' || achievement.awardLevel === filters.awardLevel),
      ),
    [achievements, filters],
  )

  return (
    <div className="space-y-6">
      <AchievementFilters
        exams={exams}
        onChange={setFilters}
        value={filters}
        years={years}
      />
      {filteredAchievements.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement) => (
            <AchievementCard achievement={achievement} key={achievement.id} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          {FIELD_LABELS.achievements.noResults}
        </p>
      )}
    </div>
  )
}
