import Link from 'next/link'
import type { Admission, Course } from '@/payload-types'

import { AdmissionStatusBadge } from '@/components/admissions/admission-status-badge'

function isCourse(value: number | Course): value is Course {
  return typeof value === 'object' && value !== null && 'title' in value
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function AdmissionCard({ admission }: { admission: Admission }) {
  const courses = admission.relatedCourses?.filter(isCourse) ?? []
  const isExpired = new Date(admission.deadline).getTime() < Date.now()

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdmissionStatusBadge status={admission.admissionStatus} />
        <time className="text-sm text-slate-500" dateTime={admission.deadline}>
          Hạn: {formatDate(admission.deadline)}{isExpired ? ' (đã hết hạn)' : ''}
        </time>
      </div>
      <h2 className="mt-4 text-xl font-extrabold leading-snug text-blue-950">
        <Link className="hover:text-orange-700" href={admission.slug ? `/tuyen-sinh/${admission.slug}` : '/tuyen-sinh'}>
          {admission.title}
        </Link>
      </h2>
      {courses.length > 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Khóa học: {courses.map((course) => course.title).join(', ')}
        </p>
      ) : null}
    </article>
  )
}

export { formatDate }
