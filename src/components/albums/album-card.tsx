import Image from 'next/image'
import Link from 'next/link'

import { getAlbumImageSource } from '@/components/albums/image-source'
import { FIELD_LABELS } from '@/lib/fields/labels'
import type { Album, Media } from '@/payload-types'

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatAlbumDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function AlbumCard({ album }: { album: Album }) {
  const firstPhoto = album.photos?.[0]?.image
  const image = isMedia(album.cover) ? album.cover : isMedia(firstPhoto) ? firstPhoto : null
  const imageSource = image ? getAlbumImageSource(image) : undefined

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={album.slug ? `/album/${album.slug}` : '/album'}>
        <div className="relative aspect-video bg-gradient-to-br from-sky-100 to-orange-100">
          {imageSource ? (
            <Image
              alt={image?.alt || album.title}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={imageSource}
              unoptimized
            />
          ) : (
            <div aria-hidden="true" className="grid h-full place-items-center text-5xl font-black text-blue-900/20">
              HSE
            </div>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white">
            {album.photos?.length ?? 0} {FIELD_LABELS.albums.photoCountSuffix}
          </span>
        </div>
        <div className="p-5">
          <h2 className="text-lg font-extrabold leading-snug text-blue-950">{album.title}</h2>
          {album.takenAt ? (
            <time className="mt-2 block text-sm text-slate-600" dateTime={album.takenAt}>
              {formatAlbumDate(album.takenAt)}
            </time>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

export { formatAlbumDate }
