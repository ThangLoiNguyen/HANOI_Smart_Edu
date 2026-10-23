import type { Metadata } from 'next'
import Link from 'next/link'

import { SEO_LABELS } from '@/lib/labels'

export const metadata: Metadata = {
  title: SEO_LABELS.notFoundTitle,
}

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-8xl font-black tracking-tight text-blue-950 sm:text-9xl">404</p>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {SEO_LABELS.notFoundHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          {SEO_LABELS.notFoundDescription}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-600"
            href="/"
          >
            {SEO_LABELS.homeButton}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-blue-900 transition hover:bg-slate-50"
            href="/tin-tuc"
          >
            {SEO_LABELS.newsButton}
          </Link>
        </div>
      </div>
    </section>
  )
}
