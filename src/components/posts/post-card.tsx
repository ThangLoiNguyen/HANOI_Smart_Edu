import Image from 'next/image'
import Link from 'next/link'
import type { Media, Post } from '@/payload-types'

import { POSTS_LABELS } from '@/lib/labels'
import { TypeBadge } from '@/components/posts/type-badge'

function isMedia(value: Post['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value))
}

export function PostCard({ post }: { post: Post }) {
  const image = isMedia(post.featuredImage) ? post.featuredImage : null
  const href = post.slug ? `/tin-tuc/${post.slug}` : '/tin-tuc'

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={href}>
        <div className="relative aspect-[16/10] overflow-hidden bg-orange-50">
          {image?.url ? (
            <Image
              alt={image.alt || post.title}
              className="object-cover transition duration-500 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={image.url}
              unoptimized
            />
          ) : (
            <div
              aria-hidden="true"
              className="grid h-full place-items-center text-5xl font-black text-orange-300"
            >
              {POSTS_LABELS.imageFallback}
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TypeBadge type={post.type} />
            {post.publishedAt ? (
              <time className="text-xs font-semibold text-slate-500" dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            ) : null}
          </div>
          <h2 className="mt-4 text-lg font-extrabold leading-snug text-blue-950">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
          ) : null}
          <span className="mt-4 inline-flex min-h-10 items-center font-bold text-blue-800">
            {POSTS_LABELS.readMore}
          </span>
        </div>
      </Link>
    </article>
  )
}
