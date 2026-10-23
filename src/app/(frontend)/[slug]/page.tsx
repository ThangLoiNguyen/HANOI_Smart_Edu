import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/pages/block-renderer'
import { findDraftBySlug } from '@/lib/draft-preview'
import { PAGES_LABELS } from '@/lib/labels'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug } from '@/lib/payload'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const pages = await buildStaticParams('pages')
  return pages.filter(({ slug }) => slug !== PAGES_LABELS.contactSlug)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === PAGES_LABELS.contactSlug) notFound()

  const { isEnabled: isDraft } = await draftMode()
  const page = isDraft
    ? await findDraftBySlug('pages', slug)
    : await findOneBySlug('pages', slug)
  if (!page) notFound()

  return buildMetadata({
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
    image: page.seo?.shareImage ?? page.featuredImage,
    slug,
  })
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params
  if (slug === PAGES_LABELS.contactSlug) notFound()

  const { isEnabled: isDraft } = await draftMode()
  const page = isDraft
    ? await findDraftBySlug('pages', slug)
    : await findOneBySlug('pages', slug)
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          {PAGES_LABELS.brandName}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-5xl">
          {page.title}
        </h1>
      </header>
      <BlockRenderer blocks={page.layout ?? []} />
    </article>
  )
}
