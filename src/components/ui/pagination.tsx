import Link from 'next/link'

import { PAGINATION_LABELS } from '@/lib/labels'

type PaginationProps = {
  totalPages: number
  currentPage: number
  basePath: string
}

type PageToken = number | 'ellipsis-start' | 'ellipsis-end'

function getPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const middlePages = new Set([
    1,
    totalPages,
    Math.max(2, currentPage - 1),
    currentPage,
    Math.min(totalPages - 1, currentPage + 1),
  ])
  const sortedPages = [...middlePages].sort((a, b) => a - b)
  const tokens: PageToken[] = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]
    if (previousPage !== undefined && page - previousPage > 1) {
      if (page - previousPage === 2) {
        tokens.push(previousPage + 1)
      } else {
        tokens.push(index === 1 ? 'ellipsis-start' : 'ellipsis-end')
      }
    }
    tokens.push(page)
  })

  return tokens
}

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/trang/${page}`
}

export function Pagination({ totalPages, currentPage, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const tokens = getPageTokens(currentPage, totalPages)

  return (
    <nav aria-label={PAGINATION_LABELS.navigation} className="mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              aria-label={PAGINATION_LABELS.previous}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={pageHref(basePath, currentPage - 1)}
            >
              {PAGINATION_LABELS.previous}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-100 px-4 text-sm font-semibold text-slate-400"
            >
              {PAGINATION_LABELS.previous}
            </span>
          )}
        </li>
        {tokens.map((token) =>
          typeof token === 'number' ? (
            <li key={token}>
              <Link
                aria-current={token === currentPage ? 'page' : undefined}
                aria-label={`${PAGINATION_LABELS.page} ${token}`}
                className={`grid h-11 min-w-11 place-items-center rounded-lg border px-3 text-sm font-bold ${
                  token === currentPage
                    ? 'border-blue-900 bg-blue-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                href={pageHref(basePath, token)}
              >
                {token}
              </Link>
            </li>
          ) : (
            <li
              aria-label={PAGINATION_LABELS.morePages}
              className="px-1 text-slate-500"
              key={token}
            >
              …
            </li>
          ),
        )}
        <li>
          {currentPage < totalPages ? (
            <Link
              aria-label={PAGINATION_LABELS.next}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              href={pageHref(basePath, currentPage + 1)}
            >
              {PAGINATION_LABELS.next}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-100 px-4 text-sm font-semibold text-slate-400"
            >
              {PAGINATION_LABELS.next}
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
