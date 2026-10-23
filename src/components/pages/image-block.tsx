import Image from 'next/image'
import type { ImageBlock, Media } from '@/payload-types'

import { PAGES_LABELS } from '@/lib/labels'

function isMedia(value: ImageBlock['image']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function ImageBlockView({ block }: { block: ImageBlock }) {
  const image = isMedia(block.image) ? block.image : null
  if (!image?.url) return null

  return (
    <figure className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100">
        <Image
          alt={image.alt || block.caption || PAGES_LABELS.imageFallback}
          className="object-cover"
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          src={image.url}
          unoptimized
        />
      </div>
      {block.caption ? (
        <figcaption className="text-center text-sm text-slate-600">{block.caption}</figcaption>
      ) : null}
    </figure>
  )
}
