import Image from 'next/image'
import Link from 'next/link'

import { FIELD_LABELS } from '@/lib/fields/labels'
import type { Achievement, Media } from '@/payload-types'

const awardPresentation: Record<Achievement['awardLevel'], { label: string; className: string }> = {
  nhat: { label: FIELD_LABELS.achievements.first, className: 'bg-amber-100 text-amber-900' },
  nhi: { label: FIELD_LABELS.achievements.second, className: 'bg-slate-200 text-slate-800' },
  ba: { label: FIELD_LABELS.achievements.third, className: 'bg-orange-100 text-orange-900' },
  'khuyen-khich': {
    label: FIELD_LABELS.achievements.consolation,
    className: 'bg-gray-100 text-gray-700',
  },
  'giai-khac': { label: FIELD_LABELS.achievements.other, className: 'bg-sky-100 text-sky-800' },
}

function isMedia(value: Achievement['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const image = isMedia(achievement.featuredImage) ? achievement.featuredImage : null
  const award = awardPresentation[achievement.awardLevel]

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-sky-100">
        {image?.url ? (
          <Image
            alt={image.alt || achievement.studentName}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={image.url}
            unoptimized
          />
        ) : (
          <div
            aria-label={FIELD_LABELS.achievements.defaultAvatar}
            className="grid h-full place-items-center"
          >
            <span
              aria-hidden="true"
              className="grid size-24 place-items-center rounded-full bg-white text-4xl font-black text-blue-900 shadow-sm"
            >
              {achievement.studentName.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${award.className}`}>
            {award.label}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            {achievement.examName}
          </span>
        </div>
        <h2 className="mt-4 text-lg font-extrabold leading-snug text-blue-950">
          {achievement.studentName}
        </h2>
        {achievement.school || achievement.className ? (
          <p className="mt-2 text-sm text-slate-600">
            {[achievement.school, achievement.className].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-semibold text-slate-700">{achievement.award}</p>
        <p className="mt-2 text-sm font-semibold text-slate-600">{achievement.year}</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center font-bold text-blue-800 hover:text-orange-700"
          href={achievement.slug ? `/thanh-tich/${achievement.slug}` : '/thanh-tich'}
        >
          {FIELD_LABELS.achievements.details}
        </Link>
      </div>
    </article>
  )
}
