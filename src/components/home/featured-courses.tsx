import Image from 'next/image'
import Link from 'next/link'

import { LAYOUT_LABELS } from '@/lib/labels'
import type { Course, Homepage, Media } from '@/payload-types'

type FeaturedCoursesProps = {
  courses: Homepage['featuredCourses']
}

function isCourse(value: number | Course): value is Course {
  return typeof value === 'object' && value !== null && 'title' in value
}

function isMedia(value: Course['featuredImage']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  const items = courses?.filter(isCourse) ?? []

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        description={LAYOUT_LABELS.coursesDescription}
        href="/khoa-hoc"
        title={LAYOUT_LABELS.coursesTitle}
      />
      {items.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course) => {
            const image = isMedia(course.featuredImage) ? course.featuredImage : null
            return (
              <article
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                key={course.id}
              >
                <Link href={course.slug ? `/khoa-hoc/${course.slug}` : '/khoa-hoc'}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-sky-100 to-orange-100">
                    {image?.url ? (
                      <Image
                        alt={image.alt || course.title}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={image.url}
                        unoptimized
                      />
                    ) : (
                      <div aria-hidden="true" className="grid h-full place-items-center text-5xl font-black text-blue-900/20">
                        {LAYOUT_LABELS.brandMonogram}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {course.grade.replace('lop-', LAYOUT_LABELS.gradePrefix)} · {course.subject}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold text-blue-950">{course.title}</h3>
                    {course.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {course.description}
                      </p>
                    ) : null}
                    <span className="mt-5 inline-flex min-h-10 items-center font-bold text-blue-800">
                      {LAYOUT_LABELS.viewCourse}
                      <Arrow />
                    </span>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyMessage>{LAYOUT_LABELS.noCourses}</EmptyMessage>
      )}
    </section>
  )
}

export function SectionHeading({
  description,
  href,
  title,
}: {
  description: string
  href: string
  title: string
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
          {LAYOUT_LABELS.brandName}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>
      <Link className="inline-flex min-h-11 items-center font-bold text-blue-800 hover:text-orange-600" href={href}>
        {LAYOUT_LABELS.viewAll}
        <Arrow />
      </Link>
    </div>
  )
}

export function EmptyMessage({ children }: { children: string }) {
  return (
    <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
      {children}
    </p>
  )
}

function Arrow() {
  return (
    <svg aria-hidden="true" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
