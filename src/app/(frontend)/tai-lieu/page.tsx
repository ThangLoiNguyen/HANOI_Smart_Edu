import type { Metadata } from 'next'

import { DocumentGrid } from '@/components/documents/document-grid'
import { DOCUMENTS_LABELS } from '@/lib/labels'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = {
  title: DOCUMENTS_LABELS.title,
}

export default async function DocumentsPage() {
  const result = await findPublished('documents', {
    limit: 200,
    pagination: false,
    sort: '-year,-publishedAt',
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          {DOCUMENTS_LABELS.brandName}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {DOCUMENTS_LABELS.title}
        </h1>
      </header>
      <DocumentGrid documents={result.docs} />
    </section>
  )
}
