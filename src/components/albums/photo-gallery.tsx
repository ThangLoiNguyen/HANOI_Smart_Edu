'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { getAlbumImageSource } from '@/components/albums/image-source'
import type { Album, Media } from '@/payload-types'

type AlbumPhoto = NonNullable<Album['photos']>[number]

function isMedia(value: AlbumPhoto['image']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function PhotoGallery({ photos }: { photos: NonNullable<Album['photos']> }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const visiblePhotos = photos.flatMap((photo) => {
    const image = isMedia(photo.image) ? photo.image : null
    const src = image ? getAlbumImageSource(image) : undefined
    return image && src ? [{ photo, image, src }] : []
  })
  const selectedPhoto =
    selectedIndex === null ? null : visiblePhotos[selectedIndex] ?? null

  useEffect(() => {
    if (selectedIndex !== null && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
    }
  }, [selectedIndex])

  function showPrevious() {
    setSelectedIndex((current) =>
      current === null ? null : (current - 1 + visiblePhotos.length) % visiblePhotos.length,
    )
  }

  function showNext() {
    setSelectedIndex((current) =>
      current === null ? null : (current + 1) % visiblePhotos.length,
    )
  }

  return (
    <section aria-label={FIELD_LABELS.albums.galleryTitle} className="mt-10">
      <h2 className="text-2xl font-black text-blue-950">{FIELD_LABELS.albums.galleryTitle}</h2>
      {visiblePhotos.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visiblePhotos.map(({ photo, image, src }, index) => (
            <button
              aria-label={photo.caption || image.alt || FIELD_LABELS.albums.galleryTitle}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              key={photo.id ?? `${image.id}-${index}`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image
                alt={photo.caption || image.alt}
                className="object-cover transition group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                src={src}
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
          {FIELD_LABELS.albums.noPhotos}
        </p>
      )}

      <dialog
        aria-label={selectedPhoto?.photo.caption || FIELD_LABELS.albums.galleryTitle}
        aria-modal="true"
        className="m-auto max-h-[92dvh] w-[min(96vw,1100px)] max-w-none rounded-2xl bg-slate-950 p-3 text-white backdrop:bg-black/85"
        onClose={() => setSelectedIndex(null)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            dialogRef.current?.close()
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            showPrevious()
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            showNext()
          }
        }}
        ref={dialogRef}
        role="dialog"
      >
        {selectedPhoto ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate font-semibold">
                {selectedPhoto.photo.caption || selectedPhoto.image.alt}
              </p>
              <button
                autoFocus
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 font-bold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                onClick={() => dialogRef.current?.close()}
                type="button"
              >
                {FIELD_LABELS.albums.close}
              </button>
            </div>
            <div className="relative h-[min(72dvh,780px)]">
              <Image
                alt={selectedPhoto.photo.caption || selectedPhoto.image.alt}
                className="object-contain"
                fill
                sizes="96vw"
                src={selectedPhoto.src}
                unoptimized
              />
            </div>
            <div className="flex justify-between gap-3">
              <button
                className="min-h-11 rounded-lg px-3 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                onClick={showPrevious}
                type="button"
              >
                {FIELD_LABELS.albums.previous}
              </button>
              <button
                className="min-h-11 rounded-lg px-3 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                onClick={showNext}
                type="button"
              >
                {FIELD_LABELS.albums.next}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  )
}
