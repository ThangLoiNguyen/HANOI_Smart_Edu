import Image from 'next/image'
import Link from 'next/link'
import type { Branch, Course, Media } from '@/payload-types'

function isMedia(value: Course['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isBranch(value: number | Branch): value is Branch {
  return typeof value === 'object' && value !== null && 'title' in value
}

function formatTuition(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function gradeLabel(grade: Course['grade']): string {
  return grade.replace('lop-', 'Lớp ')
}

const subjectLabels: Record<Course['subject'], string> = {
  toan: 'Toán',
  'ngu-van': 'Ngữ văn',
  'tieng-anh': 'Tiếng Anh',
}

export function CourseCard({ course }: { course: Course }) {
  const image = isMedia(course.featuredImage) ? course.featuredImage : null
  const branches = course.branches?.filter(isBranch) ?? []

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={course.slug ? `/khoa-hoc/${course.slug}` : '/khoa-hoc'}>
        <div className="relative aspect-video bg-gradient-to-br from-sky-100 to-orange-100">
          {image?.url ? (
            <Image
              alt={image.alt || course.title}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={image.url}
              unoptimized
            />
          ) : (
            <div aria-hidden="true" className="grid h-full place-items-center text-5xl font-black text-blue-900/20">
              HSE
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              {gradeLabel(course.grade)}
            </span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
              {subjectLabels[course.subject]}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-extrabold leading-snug text-blue-950">{course.title}</h2>
          {course.duration ? <p className="mt-2 text-sm text-slate-600">{course.duration}</p> : null}
          {branches.length > 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Cơ sở: {branches.map((branch) => branch.title).join(', ')}
            </p>
          ) : null}
          <p className="mt-4 font-bold text-blue-900">
            {course.tuition == null ? 'Liên hệ' : formatTuition(course.tuition)}
          </p>
          <span className="mt-3 inline-flex min-h-10 items-center font-bold text-blue-800">
            Xem khóa học
          </span>
        </div>
      </Link>
    </article>
  )
}

export { formatTuition, gradeLabel, subjectLabels }
