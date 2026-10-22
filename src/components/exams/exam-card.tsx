import Link from 'next/link'
import type { Exam } from '@/payload-types'

import { ExamStatusBadge } from '@/components/exams/exam-status-badge'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function ExamCard({ exam }: { exam: Exam }) {
  const firstSchedule = exam.schedule?.[0]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExamStatusBadge status={exam.examStatus} />
        <span className="text-sm font-bold text-slate-500">{exam.year}</span>
      </div>
      <h2 className="mt-4 text-xl font-extrabold leading-snug text-blue-950">
        <Link className="hover:text-orange-700" href={exam.slug ? `/ky-thi/${exam.slug}` : '/ky-thi'}>
          {exam.title}
        </Link>
      </h2>
      {firstSchedule ? (
        <p className="mt-3 text-sm text-slate-600">
          {firstSchedule.label} · {formatDate(firstSchedule.datetime)}
        </p>
      ) : null}
      {firstSchedule?.location || exam.location ? (
        <p className="mt-2 text-sm text-slate-600">{firstSchedule?.location || exam.location}</p>
      ) : null}
    </article>
  )
}

export { formatDate }
