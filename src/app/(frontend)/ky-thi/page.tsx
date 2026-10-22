import type { Metadata } from 'next'

import { ExamCard } from '@/components/exams/exam-card'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Kỳ thi',
}

export default async function ExamsPage() {
  const result = await findPublished('exams', {
    limit: 100,
    sort: '-year,-publishedAt',
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">HANOI SMART EDU</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">Kỳ thi</h1>
      </header>
      {result.docs.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.docs.map((exam) => <ExamCard exam={exam} key={exam.id} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          Thông tin kỳ thi đang được cập nhật.
        </p>
      )}
    </section>
  )
}
