import Image from 'next/image'
import Link from 'next/link'

import { EmptyMessage, SectionHeading } from '@/components/home/featured-courses'
import { LAYOUT_LABELS } from '@/lib/labels'
import type { Homepage, Media, Post } from '@/payload-types'

type FeaturedPostsProps = {
  posts: Homepage['featuredPosts']
}

function isPost(value: number | Post): value is Post {
  return typeof value === 'object' && value !== null && 'title' in value
}

function isMedia(value: Post['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const items = posts?.filter(isPost) ?? []

  return (
    <section className="bg-orange-50/70 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          description={LAYOUT_LABELS.postsDescription}
          href="/tin-tuc"
          title={LAYOUT_LABELS.postsTitle}
        />
        {items.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => {
              const image = isMedia(post.featuredImage) ? post.featuredImage : null
              return (
                <article
                  className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  key={post.id}
                >
                  <Link href={post.slug ? `/tin-tuc/${post.slug}` : '/tin-tuc'}>
                    <div className="relative aspect-[16/10] bg-orange-100">
                      {image?.url ? (
                        <Image
                          alt={image.alt || post.title}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          src={image.url}
                          unoptimized
                        />
                      ) : (
                        <div aria-hidden="true" className="grid h-full place-items-center text-6xl font-black text-orange-300">
                          {LAYOUT_LABELS.brandMonogram}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {post.publishedAt ? (
                        <time className="text-xs font-semibold text-orange-700" dateTime={post.publishedAt}>
                          {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(
                            new Date(post.publishedAt),
                          )}
                        </time>
                      ) : null}
                      <h3 className="mt-2 text-lg font-extrabold leading-snug text-blue-950">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-4 inline-flex min-h-10 items-center font-bold text-blue-800">
                        {LAYOUT_LABELS.viewPost}
                      </span>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyMessage>{LAYOUT_LABELS.noPosts}</EmptyMessage>
        )}
      </div>
    </section>
  )
}
