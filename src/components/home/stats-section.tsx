import type { Homepage } from '@/payload-types'

import { LAYOUT_LABELS } from '@/lib/labels'

type StatsSectionProps = {
  stats: Homepage['stats']
}

export function StatsSection({ stats }: StatsSectionProps) {
  const items = stats?.filter((item) => item.label || item.value) ?? []

  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-6 text-center text-xs font-extrabold tracking-[0.18em] text-orange-600">
          {LAYOUT_LABELS.statsEyebrow}
        </p>
        <div className="grid grid-cols-2 gap-6 divide-slate-200 sm:grid-cols-4 sm:divide-x">
          {items.map((item, index) => (
            <div className="px-2 text-center" key={`${item.label}-${index}`}>
              <p className="text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
