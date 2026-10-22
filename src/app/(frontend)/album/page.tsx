import type { Metadata } from 'next'

import { AlbumCard } from '@/components/albums/album-card'
import { FIELD_LABELS } from '@/lib/fields/labels'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Album ảnh',
}

export default async function AlbumsPage() {
  const result = await findPublished('albums', {
    limit: 200,
    pagination: false,
    sort: '-takenAt,-publishedAt',
  })
  const albums = [...result.docs].sort((first, second) => {
    const firstDate = first.takenAt || first.publishedAt || first.createdAt
    const secondDate = second.takenAt || second.publishedAt || second.createdAt
    return new Date(secondDate).getTime() - new Date(firstDate).getTime()
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          HANOI SMART EDU
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {FIELD_LABELS.albums.galleryTitle}
        </h1>
      </header>
      {albums.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => <AlbumCard album={album} key={album.id} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          {FIELD_LABELS.albums.updated}
        </p>
      )}
    </section>
  )
}
