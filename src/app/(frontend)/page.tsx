import type { Metadata } from 'next'
import Link from 'next/link'

import { CtaSection } from '@/components/home/cta-section'
import { FeaturedAchievements } from '@/components/home/featured-achievements'
import { FeaturedCourses } from '@/components/home/featured-courses'
import { FeaturedPosts } from '@/components/home/featured-posts'
import { HeroBanner } from '@/components/home/hero-banner'
import { StatsSection } from '@/components/home/stats-section'
import { buildMetadata } from '@/lib/metadata'
import { LAYOUT_LABELS } from '@/lib/labels'
import { getGlobal } from '@/lib/payload'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata()
}

export default async function HomePage() {
  const homepage = await getGlobal<'homepage'>('homepage')

  return (
    <>
      <HeroBanner banners={homepage.banners} />
      <section className="bg-orange-500 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-100">
              {LAYOUT_LABELS.placementTestEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {LAYOUT_LABELS.placementTestBannerTitle}
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-orange-50">
              {LAYOUT_LABELS.placementTestBannerDescription}
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-white px-6 font-extrabold text-orange-700 shadow-sm transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href="/kiem-tra-dau-vao"
          >
            {LAYOUT_LABELS.placementTestButton}
          </Link>
        </div>
      </section>
      <StatsSection stats={homepage.stats} />
      <FeaturedCourses courses={homepage.featuredCourses} />
      <FeaturedPosts posts={homepage.featuredPosts} />
      <FeaturedAchievements achievements={homepage.featuredAchievements} />
      <CtaSection data={homepage.ctaBlock} />
    </>
  )
}
