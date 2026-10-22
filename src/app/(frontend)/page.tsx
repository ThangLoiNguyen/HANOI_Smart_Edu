import type { Metadata } from 'next'

import { CtaSection } from '@/components/home/cta-section'
import { FeaturedAchievements } from '@/components/home/featured-achievements'
import { FeaturedCourses } from '@/components/home/featured-courses'
import { FeaturedPosts } from '@/components/home/featured-posts'
import { HeroBanner } from '@/components/home/hero-banner'
import { StatsSection } from '@/components/home/stats-section'
import { buildMetadata } from '@/lib/metadata'
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
      <StatsSection stats={homepage.stats} />
      <FeaturedCourses courses={homepage.featuredCourses} />
      <FeaturedPosts posts={homepage.featuredPosts} />
      <FeaturedAchievements achievements={homepage.featuredAchievements} />
      <CtaSection data={homepage.ctaBlock} />
    </>
  )
}
