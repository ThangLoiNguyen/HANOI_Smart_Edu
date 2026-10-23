import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { PostCard } from '@/components/posts/post-card'
import { TypeBadge } from '@/components/posts/type-badge'
import { RichText } from '@/components/layout/rich-text'
import { findDraftBySlug } from '@/lib/draft-preview'
import { POSTS_LABELS } from '@/lib/labels'
import { buildMetadata, buildStaticParams, getSiteSettings } from '@/lib/metadata'
import { findOneBySlug, findPublished } from '@/lib/payload'
import type { Category, Media, Post } from '@/payload-types'

export const revalidate = 3600

type PostPageProps = {
  params: Promise<{ slug: string }>
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isCategory(value: number | Category): value is Category {
  return typeof value === 'object' && value !== null && 'title' in value
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value))
}

export async function generateStaticParams() {
  const batchSize = 1000
  const firstBatch = await buildStaticParams('posts', batchSize)
  const pageInfo = await findPublished('posts', { page: 1, limit: batchSize })

  if (pageInfo.totalPages <= 1) return firstBatch

  const remainingBatches = await Promise.all(
    Array.from({ length: pageInfo.totalPages - 1 }, (_, index) =>
      findPublished('posts', { page: index + 2, limit: batchSize }),
    ),
  )
  const allSlugs = [
    ...firstBatch,
    ...remainingBatches.flatMap((batch) =>
      batch.docs.flatMap((post) =>
        typeof post.slug === 'string' ? [{ slug: post.slug }] : [],
      ),
    ),
  ]

  return [...new Map(allSlugs.map((item) => [item.slug, item])).values()]
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = isDraft
    ? await findDraftBySlug('posts', slug)
    : await findOneBySlug('posts', slug)
  if (!post) notFound()

  return buildMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: post.seo?.shareImage ?? post.featuredImage,
    slug: `tin-tuc/${slug}`,
  })
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = isDraft
    ? await findDraftBySlug('posts', slug)
    : await findOneBySlug('posts', slug)
  if (!post) notFound()

  const [siteSettings, relatedResult] = await Promise.all([
    getSiteSettings(),
    findPublished('posts', {
      limit: 3,
      sort: '-publishedAt',
      where: {
        and: [
          { id: { not_equals: post.id } },
          {
            or: [
              ...(post.categories?.length
                ? [
                    {
                      categories: {
                        in: post.categories.map((category) =>
                          typeof category === 'number' ? category : category.id,
                        ),
                      },
                    },
                  ]
                : []),
              { type: { equals: post.type } },
            ],
          },
        ],
      },
    }),
  ])

  const image = isMedia(post.featuredImage) ? post.featuredImage : null
  const categories = post.categories?.filter(isCategory) ?? []
  const relatedPosts = relatedResult.docs.filter((item) => item.id !== post.id)
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt || undefined,
    image: image?.url ? [image.url] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: siteSettings.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteSettings.siteName,
    },
    mainEntityOfPage: `/tin-tuc/${slug}`,
  }
  const jsonLd = JSON.stringify(articleData).replace(/</g, '\\u003c')

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label={POSTS_LABELS.breadcrumbNavigation} className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-orange-700" href="/">
              {POSTS_LABELS.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-orange-700" href="/tin-tuc">
              {POSTS_LABELS.breadcrumbNews}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">
            {post.title}
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <TypeBadge type={post.type} />
        {post.publishedAt ? (
          <time className="text-sm text-slate-500" dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
        ) : null}
        {categories.map((category) => (
          <span
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            key={category.id}
          >
            {category.title}
          </span>
        ))}
      </div>

      <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-blue-950 sm:text-5xl">
        {post.title}
      </h1>

      {image?.url ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          <Image
            alt={image.alt || post.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            src={image.url}
            unoptimized
          />
        </div>
      ) : null}

      {post.type === 'bao-chi' && (post.source || post.sourceUrl) ? (
        <p className="mt-6 text-sm text-slate-600">
          {POSTS_LABELS.source}: {post.source || post.sourceUrl}
          {post.sourceUrl ? (
            <>
              {' — '}
              <a
                className="font-semibold text-blue-800 underline underline-offset-2"
                href={post.sourceUrl}
                rel="noopener"
                target="_blank"
              >
                {post.sourceUrl}
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {post.excerpt ? (
        <p className="mt-8 border-l-4 border-orange-400 pl-5 text-lg font-semibold leading-8 text-slate-700">
          {post.excerpt}
        </p>
      ) : null}

      {post.content ? (
        <RichText
          className="prose prose-slate mt-8 max-w-none text-base leading-8"
          data={post.content}
        />
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-blue-950">{POSTS_LABELS.relatedTitle}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <PostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      ) : null}

      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </article>
  )
}
