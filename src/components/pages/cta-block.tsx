import Link from 'next/link'
import type { CtaBlock } from '@/payload-types'

export function CtaBlockView({ block }: { block: CtaBlock }) {
  if (!block.heading && !block.description && !block.buttonLabel) return null

  return (
    <section className="rounded-3xl bg-blue-950 px-6 py-10 text-center text-white sm:px-10">
      {block.heading ? <h2 className="text-2xl font-black sm:text-3xl">{block.heading}</h2> : null}
      {block.description ? <p className="mx-auto mt-3 max-w-2xl leading-7 text-blue-100">{block.description}</p> : null}
      {block.buttonLabel && block.buttonLink ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-6 font-bold text-white hover:bg-orange-600"
          href={block.buttonLink}
        >
          {block.buttonLabel}
        </Link>
      ) : null}
    </section>
  )
}
