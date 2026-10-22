import type { Metadata } from 'next'

import { AchievementGrid } from '@/components/achievements/achievement-grid'
import { FIELD_LABELS } from '@/lib/fields/labels'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Bảng vàng thành tích',
}

export default async function AchievementsPage() {
  const result = await findPublished('achievements', {
    limit: 200,
    pagination: false,
    sort: '-year,-publishedAt',
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          HANOI SMART EDU
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {FIELD_LABELS.achievements.breadcrumbAchievements}
        </h1>
      </header>
      <AchievementGrid achievements={result.docs} />
    </section>
  )
}
