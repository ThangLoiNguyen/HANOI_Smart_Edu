import type { Metadata } from 'next'

import { CourseCard } from '@/components/courses/course-card'
import { DocumentCard } from '@/components/documents/document-card'
import { ExamCard } from '@/components/exams/exam-card'
import { PostCard } from '@/components/posts/post-card'
import { SEARCH_LABELS } from '@/lib/labels'
import { searchContent } from '@/lib/payload'

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

export const metadata: Metadata = {
  title: SEARCH_LABELS.title,
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim() : ''

  if (!query) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-4 py-16 sm:px-6">
        <h1 className="text-center text-3xl font-black text-blue-950 sm:text-4xl">
          {SEARCH_LABELS.title}
        </h1>
        <SearchForm />
        <p className="mt-4 text-center text-sm text-slate-500">{SEARCH_LABELS.emptyPrompt}</p>
      </section>
    )
  }

  const results = await searchContent(query)
  const hasResults = Object.values(results).some((items) => items.length > 0)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-3xl">
        <h1 className="text-3xl font-black text-blue-950">{SEARCH_LABELS.title}</h1>
        <SearchForm query={query} />
        <p className="mt-4 text-sm text-slate-600">
          {SEARCH_LABELS.resultsFor} <span className="font-bold text-slate-900">“{query}”</span>
        </p>
      </header>

      {!hasResults ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-slate-600">
          {SEARCH_LABELS.noResults} “{query}”.
        </p>
      ) : (
        <div className="space-y-12">
          {results.courses.length > 0 ? (
            <ResultSection title={SEARCH_LABELS.courses}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.courses.map((course) => <CourseCard course={course} key={course.id} />)}
              </div>
            </ResultSection>
          ) : null}
          {results.posts.length > 0 ? (
            <ResultSection title={SEARCH_LABELS.posts}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.posts.map((post) => <PostCard post={post} key={post.id} />)}
              </div>
            </ResultSection>
          ) : null}
          {results.documents.length > 0 ? (
            <ResultSection title={SEARCH_LABELS.documents}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.documents.map((document) => (
                  <DocumentCard document={document} key={document.id} />
                ))}
              </div>
            </ResultSection>
          ) : null}
          {results.exams.length > 0 ? (
            <ResultSection title={SEARCH_LABELS.exams}>
              <div className="grid gap-5 md:grid-cols-2">
                {results.exams.map((exam) => <ExamCard exam={exam} key={exam.id} />)}
              </div>
            </ResultSection>
          ) : null}
        </div>
      )}
    </section>
  )
}

function SearchForm({ query = '' }: { query?: string }) {
  return (
    <form action="/tim-kiem" className="mt-6 flex gap-2" method="GET">
      <input
        aria-label={SEARCH_LABELS.title}
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        defaultValue={query}
        name="q"
        placeholder={SEARCH_LABELS.inputPlaceholder}
        required
      />
      <button
        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        type="submit"
      >
        {SEARCH_LABELS.submit}
      </button>
    </form>
  )
}

function ResultSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section>
      <h2 className="mb-5 border-b border-slate-200 pb-3 text-xl font-extrabold text-blue-950">
        {title}
      </h2>
      {children}
    </section>
  )
}