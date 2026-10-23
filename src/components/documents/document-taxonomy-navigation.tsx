'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  DOCUMENT_LEVELS,
  getDocumentCategories,
  getDocumentTaxonomyPath,
  type DocumentCategory,
  type DocumentGrade,
  type DocumentLevel,
} from '@/lib/document-taxonomy'
import { DOCUMENTS_LABELS } from '@/lib/labels'

type DocumentTaxonomyNavigationProps = {
  active?: { level: DocumentLevel; grade: DocumentGrade; category: DocumentCategory }
}

export function DocumentTaxonomyNavigation({ active }: DocumentTaxonomyNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const isVisible = isOpen || isDesktop

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const updateViewport = () => setIsDesktop(desktopQuery.matches)
    updateViewport()
    desktopQuery.addEventListener('change', updateViewport)
    return () => desktopQuery.removeEventListener('change', updateViewport)
  }, [])

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <button
        aria-controls="document-taxonomy-navigation"
        aria-expanded={isVisible}
        className="flex min-h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left font-bold text-blue-950 shadow-sm lg:hidden"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>{isOpen ? DOCUMENTS_LABELS.closeDocumentNavigation : DOCUMENTS_LABELS.openDocumentNavigation}</span>
        <ChevronIcon isOpen={isVisible} />
      </button>
      <div
        aria-hidden={!isVisible}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:grid-rows-[1fr] lg:opacity-100 ${
          isVisible ? 'mt-4 grid-rows-[1fr] opacity-100 lg:mt-0' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
        id="document-taxonomy-navigation"
        inert={!isVisible}
      >
        <nav
          aria-label={DOCUMENTS_LABELS.openDocumentNavigation}
          className={`min-h-0 max-h-[60vh] space-y-6 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm transition-[padding] duration-300 lg:max-h-[calc(100vh-8rem)] ${
            isVisible ? 'p-4' : 'p-0'
          }`}
        >
          {DOCUMENT_LEVELS.map((level) => (
            <section key={level.value}>
              <h2 className="mb-2 text-sm font-extrabold uppercase text-orange-700">{level.label}</h2>
              <div className="space-y-3">
                {level.grades.map((grade) => {
                  const gradeIsActive = active?.level === level.value && active.grade === grade
                  const categories = getDocumentCategories(level.value, grade)

                  return (
                    <div key={grade}>
                      <Link
                        aria-current={gradeIsActive ? 'location' : undefined}
                        className={`block rounded-md px-2 py-1.5 text-sm font-bold transition-colors ${
                          gradeIsActive ? 'bg-orange-50 text-orange-800' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        href={getDocumentTaxonomyPath(level.value, grade, 'gk1')}
                        onClick={() => setIsOpen(false)}
                      >
                        {DOCUMENTS_LABELS.grades[grade]}
                      </Link>
                      <div className="ml-3 mt-1 border-l border-slate-200 pl-2">
                        {categories.map((category) => {
                          const isCurrent =
                            active?.level === level.value &&
                            active.grade === grade &&
                            active.category === category

                          return (
                            <Link
                              aria-current={isCurrent ? 'page' : undefined}
                              className={`block rounded px-2 py-1 text-xs transition-colors ${
                                isCurrent
                                  ? 'font-bold text-blue-900'
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-800'
                              }`}
                              href={getDocumentTaxonomyPath(level.value, grade, category)}
                              key={category}
                              onClick={() => setIsOpen(false)}
                            >
                              {DOCUMENTS_LABELS.taxonomyCategories[category]}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
