import type { Metadata } from 'next'

import { PostCard } from '@/components/posts/post-card'
import { Pagination } from '@/components/ui/pagination'
import { POSTS_LABELS } from '@/lib/labels'
import { getSiteSettings } from '@/lib/metadata'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: POSTS_LABELS.title,
    description: settings.defaultSeo?.metaDescription || undefined,
  }
}

export default async function PostsPage() {
  const result = await findPublished('posts', {
    page: 1,
    limit: 10,
    sort: '-publishedAt',
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          {POSTS_LABELS.brandName}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {POSTS_LABELS.title}
        </h1>
      </header>
      {result.docs.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.docs.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          {POSTS_LABELS.empty}
        </p>
      )}
      <Pagination totalPages={result.totalPages} currentPage={1} basePath="/tin-tuc" />
    </section>
  )
}
