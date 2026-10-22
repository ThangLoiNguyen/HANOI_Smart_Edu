import Image from 'next/image'
import Link from 'next/link'

import { EmptyMessage, SectionHeading } from '@/components/home/featured-courses'
import { LAYOUT_LABELS } from '@/lib/labels'
import type { Achievement, Homepage, Media } from '@/payload-types'

type FeaturedAchievementsProps = {
  achievements: Homepage['featuredAchievements']
}

function isAchievement(value: number | Achievement): value is Achievement {
  return typeof value === 'object' && value !== null && 'studentName' in value
}

function isMedia(value: Achievement['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function FeaturedAchievements({ achievements }: FeaturedAchievementsProps) {
  const items = achievements?.filter(isAchievement) ?? []

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        description={LAYOUT_LABELS.achievementsDescription}
        href="/thanh-tich"
        title={LAYOUT_LABELS.achievementsTitle}
      />
      {items.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((achievement) => {
            const image = isMedia(achievement.featuredImage) ? achievement.featuredImage : null
            return (
              <article
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
                key={achievement.id}
              >
                <Link href={achievement.slug ? `/thanh-tich/${achievement.slug}` : '/thanh-tich'}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                    {image?.url ? (
                      <Image
                        alt={image.alt || achievement.studentName}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={image.url}
                        unoptimized
                      />
                    ) : (
                      <div aria-hidden="true" className="grid h-full place-items-center text-6xl font-black text-orange-500/40">
                        {LAYOUT_LABELS.brandMonogram}
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
                      {achievement.year}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                      {achievement.examName}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold text-blue-950">
                      {achievement.studentName}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{achievement.award}</p>
                    {achievement.school ? (
                      <p className="mt-2 text-sm text-slate-500">{achievement.school}</p>
                    ) : null}
                    <span className="mt-4 inline-flex min-h-10 items-center font-bold text-blue-800">
                      {LAYOUT_LABELS.viewAchievement}
                    </span>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyMessage>{LAYOUT_LABELS.noAchievements}</EmptyMessage>
      )}
    </section>
  )
}
