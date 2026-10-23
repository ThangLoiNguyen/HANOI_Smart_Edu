import type { StatsBlock } from '@/payload-types'

import { PAGES_LABELS } from '@/lib/labels'

export function StatsBlockView({ block }: { block: StatsBlock }) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <section aria-label={PAGES_LABELS.statsAriaLabel} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <article
          className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          key={item.id ?? `${item.label}-${index}`}
        >
          <p className="text-3xl font-black text-blue-900">{item.value}</p>
          <p className="mt-2 font-semibold text-slate-600">{item.label}</p>
        </article>
      ))}
    </section>
  )
}
