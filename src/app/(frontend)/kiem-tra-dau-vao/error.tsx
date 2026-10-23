'use client'

import { ROUTE_ERROR_LABELS } from '@/lib/labels'

type RouteErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PlacementTestError({ reset }: RouteErrorProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-slate-900">{ROUTE_ERROR_LABELS.title}</h2>
      <p className="mt-2 text-slate-600">{ROUTE_ERROR_LABELS.description}</p>
      <button
        className="mt-4 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
        onClick={() => reset()}
        type="button"
      >
        {ROUTE_ERROR_LABELS.retry}
      </button>
    </section>
  )
}