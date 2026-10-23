import type { Metadata } from 'next'
import Link from 'next/link'

import { DOCUMENT_LEVELS, getDocumentCategories, getDocumentTaxonomyPath } from '@/lib/document-taxonomy'
import { DOCUMENTS_LABELS } from '@/lib/labels'

export const metadata: Metadata = {
  title: DOCUMENTS_LABELS.title,
}

export default function DocumentsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          {DOCUMENTS_LABELS.brandName}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {DOCUMENTS_LABELS.title}
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          {DOCUMENTS_LABELS.selectionDescription}
        </p>
      </header>
      <div className="space-y-12">
        {DOCUMENT_LEVELS.map((level) => (
          <section aria-labelledby={`level-${level.value}`} key={level.value}>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-orange-600">
                  {DOCUMENTS_LABELS.brandName}
                </p>
                <h2 className="mt-1 text-2xl font-black text-blue-950" id={`level-${level.value}`}>
                  {level.label}
                </h2>
              </div>
              <span className="text-sm text-slate-500">
                {level.grades.length} {DOCUMENTS_LABELS.gradeCount}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {level.grades.map((grade) => {
                const categories = getDocumentCategories(level.value, grade)

                return (
                  <article
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                    key={grade}
                  >
                    <Link
                      className="group flex items-start justify-between gap-3"
                      href={getDocumentTaxonomyPath(level.value, grade, 'gk1')}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {level.label}
                        </p>
                        <h3 className="mt-1 text-xl font-extrabold text-blue-950 group-hover:text-orange-700">
                          {DOCUMENTS_LABELS.grades[grade]}
                        </h3>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue-800">
                        {categories.length} {DOCUMENTS_LABELS.categoryCount}
                      </span>
                    </Link>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Link
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                          href={getDocumentTaxonomyPath(level.value, grade, category)}
                          key={category}
                        >
                          {DOCUMENTS_LABELS.taxonomyCategories[category]}
                        </Link>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
