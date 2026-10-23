import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DocumentCard } from '@/components/documents/document-card'
import { DocumentTaxonomyNavigation } from '@/components/documents/document-taxonomy-navigation'
import {
  DOCUMENT_LEVELS,
  getDocumentTaxonomyParams,
  isValidDocumentCategory,
  type DocumentCategory,
  type DocumentGrade,
  type DocumentLevel,
} from '@/lib/document-taxonomy'
import { DOCUMENTS_LABELS } from '@/lib/labels'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

type DocumentTaxonomyPageProps = {
  params: Promise<{ level: string; grade: string; category: string }>
}

export function generateStaticParams() {
  return getDocumentTaxonomyParams()
}

export async function generateMetadata({ params }: DocumentTaxonomyPageProps): Promise<Metadata> {
  const { level, grade, category } = await params
  const levelConfig = DOCUMENT_LEVELS.find((item) => item.value === level)
  if (!levelConfig || !isValidDocumentCategory(level, grade, category)) {
    return { title: DOCUMENTS_LABELS.title }
  }

  return {
    title: `${DOCUMENTS_LABELS.taxonomyCategories[category]} - ${DOCUMENTS_LABELS.grades[grade as DocumentGrade]} - ${levelConfig.label}`,
  }
}

export default async function DocumentTaxonomyPage({ params }: DocumentTaxonomyPageProps) {
  const { level, grade, category } = await params
  const levelConfig = DOCUMENT_LEVELS.find((item) => item.value === level)
  if (!levelConfig || !isValidDocumentCategory(level, grade, category)) notFound()

  const selectedGrade = grade as DocumentGrade
  const selectedCategory = category as DocumentCategory
  const result = await findPublished('documents', {
    limit: 200,
    pagination: false,
    sort: '-year,-publishedAt',
    where: {
      and: [
        { level: { equals: level } },
        { grade: { equals: selectedGrade } },
        { category: { equals: selectedCategory } },
      ],
    },
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          {DOCUMENTS_LABELS.title}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
          {DOCUMENTS_LABELS.taxonomyCategories[selectedCategory]} -{' '}
          {DOCUMENTS_LABELS.grades[selectedGrade]} - {levelConfig.label}
        </h1>
      </header>
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <DocumentTaxonomyNavigation
          active={{
            level: level as DocumentLevel,
            grade: selectedGrade,
            category: selectedCategory,
          }}
        />
        <div>
          {result.docs.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.docs.map((document) => <DocumentCard document={document} key={document.id} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <p className="text-lg font-bold text-blue-950">{DOCUMENTS_LABELS.emptyForSelection}</p>
              <p className="mt-2 text-sm text-slate-500">
                {DOCUMENTS_LABELS.taxonomyCategories[selectedCategory]} ·{' '}
                {DOCUMENTS_LABELS.grades[selectedGrade]} · {levelConfig.label}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
