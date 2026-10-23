import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { findDraftBySlug } from '@/lib/draft-preview'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug } from '@/lib/payload'
import type { Achievement, Media } from '@/payload-types'

export const revalidate = 3600

type AchievementPageProps = {
  params: Promise<{ slug: string }>
}

function isMedia(value: Achievement['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export async function generateStaticParams() {
  return buildStaticParams('achievements')
}

export async function generateMetadata({ params }: AchievementPageProps): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const achievement = isDraft
    ? await findDraftBySlug('achievements', slug)
    : await findOneBySlug('achievements', slug)
  if (!achievement) notFound()

  return buildMetadata({
    title: achievement.seo?.metaTitle || achievement.studentName,
    description:
      achievement.seo?.metaDescription ||
      achievement.note ||
      `${achievement.award} - ${achievement.examName} ${achievement.year}`,
    image: achievement.seo?.shareImage ?? achievement.featuredImage,
    slug: `thanh-tich/${slug}`,
  })
}

export default async function AchievementDetailPage({ params }: AchievementPageProps) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const achievement = isDraft
    ? await findDraftBySlug('achievements', slug)
    : await findOneBySlug('achievements', slug)
  if (!achievement) notFound()
  const image = isMedia(achievement.featuredImage) ? achievement.featuredImage : null

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-orange-700" href="/">
              {FIELD_LABELS.achievements.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-orange-700" href="/thanh-tich">
              {FIELD_LABELS.achievements.breadcrumbAchievements}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">
            {achievement.studentName}
          </li>
        </ol>
      </nav>

      {image?.url ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-video">
          <Image
            alt={image.alt || achievement.studentName}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={image.url}
            unoptimized
          />
        </div>
      ) : null}

      <h1 className="mt-8 text-3xl font-black leading-tight tracking-tight text-blue-950 sm:text-5xl">
        {achievement.studentName}
      </h1>
      <div className="mt-6 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.achievements.school}</h2>
          <p className="mt-2 text-slate-600">{achievement.school || '—'}</p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.achievements.className}</h2>
          <p className="mt-2 text-slate-600">{achievement.className || '—'}</p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.achievements.award}</h2>
          <p className="mt-2 text-slate-600">{achievement.award}</p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.achievements.awardLevel}</h2>
          <p className="mt-2 text-slate-600">
            {FIELD_LABELS.achievements[
              achievement.awardLevel === 'nhat'
                ? 'first'
                : achievement.awardLevel === 'nhi'
                  ? 'second'
                  : achievement.awardLevel === 'ba'
                    ? 'third'
                    : achievement.awardLevel === 'khuyen-khich'
                      ? 'consolation'
                      : 'other'
            ]}
          </p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.achievements.examName}</h2>
          <p className="mt-2 text-slate-600">{achievement.examName}</p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.achievements.year}</h2>
          <p className="mt-2 text-slate-600">{achievement.year}</p>
        </div>
      </div>
      {achievement.note ? (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-blue-950">{FIELD_LABELS.achievements.note}</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{achievement.note}</p>
        </section>
      ) : null}
    </article>
  )
}
