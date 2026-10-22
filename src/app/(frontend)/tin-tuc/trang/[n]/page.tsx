import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostCard } from '@/components/posts/post-card'
import { Pagination } from '@/components/ui/pagination'
import { PAGINATION_LABELS, POSTS_LABELS } from '@/lib/labels'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

type PostsPaginationPageProps = {
  params: Promise<{ n: string }>
}

function parsePageNumber(value: string): number | null {
  const page = Number(value)
  return Number.isInteger(page) && page >= 2 ? page : null
}

export async function generateStaticParams() {
  const firstPage = await findPublished('posts', { page: 1, limit: 10 })
  return Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) => ({
    n: String(index + 2),
  }))
}

export async function generateMetadata({ params }: PostsPaginationPageProps): Promise<Metadata> {
  const { n } = await params
  const page = parsePageNumber(n)
  if (page === null) notFound()

  return {
    title: `${POSTS_LABELS.title} - ${PAGINATION_LABELS.page} ${page}`,
  }
}

export default async function PostsPaginationPage({ params }: PostsPaginationPageProps) {
  const { n } = await params
  const page = parsePageNumber(n)
  if (page === null) notFound()

  const firstPage = await findPublished('posts', { page: 1, limit: 10 })
  if (page > firstPage.totalPages) notFound()

  const result = await findPublished('posts', {
    page,
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
          <span className="ml-2 text-slate-400">— {page}</span>
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
      <Pagination totalPages={result.totalPages} currentPage={page} basePath="/tin-tuc" />
    </section>
  )
}
