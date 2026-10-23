import Image from 'next/image'
import type { Branch, Media } from '@/payload-types'

import { BRANCHES_LABELS } from '@/lib/labels'

function isMedia(value: Branch['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function BranchCard({ branch }: { branch: Branch }) {
  const image = isMedia(branch.featuredImage) ? branch.featuredImage : null

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-sky-100 to-orange-100">
        {image?.url ? (
          <Image
            alt={image.alt || branch.title}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={image.url}
            unoptimized
          />
        ) : (
          <div aria-label={BRANCHES_LABELS.imageFallback} className="grid h-full place-items-center text-5xl font-black text-blue-900/20">
            HSE
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="text-lg font-extrabold leading-snug text-blue-950">{branch.title}</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            <span className="font-bold text-slate-800">{BRANCHES_LABELS.address}: </span>
            {branch.address}
          </p>
          {branch.phone ? (
            <p>
              <span className="font-bold text-slate-800">{BRANCHES_LABELS.phone}: </span>
              <a className="underline underline-offset-2 hover:text-orange-700" href={`tel:${branch.phone}`}>
                {branch.phone}
              </a>
            </p>
          ) : null}
          {branch.workingHours ? (
            <p>
              <span className="font-bold text-slate-800">{BRANCHES_LABELS.workingHours}: </span>
              {branch.workingHours}
            </p>
          ) : null}
        </div>
        {branch.googleMapsUrl ? (
          <a
            className="mt-4 inline-flex min-h-11 items-center font-bold text-blue-800 underline-offset-2 hover:text-orange-700 hover:underline"
            href={branch.googleMapsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {BRANCHES_LABELS.viewMap}
          </a>
        ) : null}
      </div>
    </article>
  )
}
