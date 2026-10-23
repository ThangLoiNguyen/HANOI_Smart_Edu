import Image from 'next/image'
import type { Document, Media } from '@/payload-types'

import { DOCUMENTS_LABELS } from '@/lib/labels'

function isMedia(value: Document['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isFile(value: Document['file']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function DocumentCard({ document }: { document: Document }) {
  const image = isMedia(document.featuredImage) ? document.featuredImage : null
  const file = isFile(document.file) ? document.file : null
  const href = file?.url || document.externalLink
  const linkLabel = file?.url ? DOCUMENTS_LABELS.download : DOCUMENTS_LABELS.openLink

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-sky-100 to-orange-100">
        {image?.url ? (
          <Image
            alt={image.alt || document.title}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={image.url}
            unoptimized
          />
        ) : (
          <div aria-hidden="true" className="grid h-full place-items-center text-5xl font-black text-blue-900/20">
            HSE
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
            {DOCUMENTS_LABELS.types[document.type]}
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
            {DOCUMENTS_LABELS.grades[document.grade]}
          </span>
        </div>
        <h2 className="mt-4 text-lg font-extrabold leading-snug text-blue-950">
          {document.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {DOCUMENTS_LABELS.subjects[document.subject]} · {document.year}
        </p>
        {href ? (
          <a
            className="mt-4 inline-flex min-h-11 items-center font-bold text-blue-800 underline-offset-2 hover:text-orange-700 hover:underline"
            href={href}
            rel={file?.url ? undefined : 'noopener noreferrer'}
            target={file?.url ? undefined : '_blank'}
          >
            {linkLabel}
          </a>
        ) : null}
      </div>
    </article>
  )
}
