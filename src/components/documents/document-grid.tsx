'use client'

import { useMemo, useState } from 'react'

import { DocumentCard } from '@/components/documents/document-card'
import { DocumentFilters, type DocumentFiltersValue } from '@/components/documents/document-filters'
import { DOCUMENTS_LABELS } from '@/lib/labels'
import type { Document } from '@/payload-types'

export function DocumentGrid({ documents }: { documents: Document[] }) {
  const [filters, setFilters] = useState<DocumentFiltersValue>({
    type: 'all',
    grade: 'all',
    subject: 'all',
    year: 'all',
  })
  const years = useMemo(
    () => [...new Set(documents.map(({ year }) => year))].sort((first, second) => second - first),
    [documents],
  )
  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          (filters.type === 'all' || document.type === filters.type) &&
          (filters.grade === 'all' || document.grade === filters.grade) &&
          (filters.subject === 'all' || document.subject === filters.subject) &&
          (filters.year === 'all' || document.year === filters.year),
      ),
    [documents, filters],
  )

  return (
    <div className="space-y-6">
      <DocumentFilters onChange={setFilters} value={filters} years={years} />
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard document={document} key={document.id} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          {documents.length > 0 ? DOCUMENTS_LABELS.noResults : DOCUMENTS_LABELS.updated}
        </p>
      )}
    </div>
  )
}
