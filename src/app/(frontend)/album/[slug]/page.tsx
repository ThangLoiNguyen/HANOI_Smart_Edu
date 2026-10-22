import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { formatAlbumDate } from '@/components/albums/album-card'
import { PhotoGallery } from '@/components/albums/photo-gallery'
import { FIELD_LABELS } from '@/lib/fields/labels'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug } from '@/lib/payload'
import type { Album, Media, Post } from '@/payload-types'

export const revalidate = 3600

type AlbumPageProps = {
  params: Promise<{ slug: string }>
}

function isMedia(value: Album['cover']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isPost(value: number | Post): value is Post {
  return typeof value === 'object' && value !== null && 'title' in value
}

export async function generateStaticParams() {
  return buildStaticParams('albums')
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params
  const album = await findOneBySlug('albums', slug)
  if (!album) notFound()

  const cover = isMedia(album.cover) ? album.cover : album.photos?.[0]?.image
  return buildMetadata({
    title: album.seo?.metaTitle || album.title,
    description: album.seo?.metaDescription,
    image: album.seo?.shareImage ?? cover,
    slug: `album/${slug}`,
  })
}

export default async function AlbumDetailPage({ params }: AlbumPageProps) {
  const { slug } = await params
  const album = await findOneBySlug('albums', slug)
  if (!album) notFound()
  const events = album.relatedEvent?.filter(isPost) ?? []

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-orange-700" href="/">
              {FIELD_LABELS.albums.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-orange-700" href="/album">
              {FIELD_LABELS.albums.galleryTitle}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">{album.title}</li>
        </ol>
      </nav>
      <h1 className="text-3xl font-black leading-tight tracking-tight text-blue-950 sm:text-5xl">
        {album.title}
      </h1>
      {album.takenAt ? (
        <p className="mt-3 text-slate-600">
          {FIELD_LABELS.albums.dateLabel}: {formatAlbumDate(album.takenAt)}
        </p>
      ) : null}

      {events.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-bold text-blue-950">{FIELD_LABELS.albums.relatedEvent}</h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  className="font-semibold text-blue-800 underline underline-offset-2 hover:text-orange-700"
                  href={event.slug ? `/tin-tuc/${event.slug}` : '/tin-tuc'}
                >
                  {event.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PhotoGallery photos={album.photos ?? []} />
    </article>
  )
}
