import Link from 'next/link'

import { LAYOUT_LABELS } from '@/lib/labels'
import type { Homepage } from '@/payload-types'

type CtaSectionProps = {
  data: Homepage['ctaBlock']
}

export function CtaSection({ data }: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-blue-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <div aria-hidden="true" className="absolute -right-16 -top-28 -z-10 h-72 w-72 rounded-full bg-orange-400/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
        <p className="text-xs font-extrabold tracking-[0.2em] text-orange-200">
          {LAYOUT_LABELS.ctaEyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          {data?.heading || LAYOUT_LABELS.ctaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">
          {data?.description || LAYOUT_LABELS.ctaDescription}
        </p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 font-bold text-white shadow-lg transition hover:bg-orange-400"
          href={data?.buttonLink || '/lien-he'}
        >
          {data?.buttonLabel || LAYOUT_LABELS.ctaButton}
        </Link>
      </div>
    </section>
  )
}
