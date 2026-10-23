import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { CourseCard, formatTuition, gradeLabel, subjectLabels } from '@/components/courses/course-card'
import { RichText } from '@/components/layout/rich-text'
import { findDraftBySlug } from '@/lib/draft-preview'
import { COURSE_SCHEDULE_LABELS } from '@/lib/labels'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug, findPublished, getPayloadClient } from '@/lib/payload'
import type { Branch, Course, Document, Media, Schedule } from '@/payload-types'

export const revalidate = 3600

type CoursePageProps = {
  params: Promise<{ slug: string }>
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isBranch(value: number | Branch): value is Branch {
  return typeof value === 'object' && value !== null && 'title' in value
}

function isDocument(value: number | Document): value is Document {
  return typeof value === 'object' && value !== null && 'title' in value
}

function formatStartDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value))
}

function isScheduleLocation(value: Schedule['location']): value is Branch {
  return typeof value === 'object' && value !== null && 'title' in value
}

export async function generateStaticParams() {
  return buildStaticParams('courses')
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const course = isDraft
    ? await findDraftBySlug('courses', slug)
    : await findOneBySlug('courses', slug)
  if (!course) notFound()

  return buildMetadata({
    title: course.seo?.metaTitle || course.title,
    description: course.seo?.metaDescription || course.description,
    image: course.seo?.shareImage ?? course.featuredImage,
    slug: `khoa-hoc/${slug}`,
  })
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const course = isDraft
    ? await findDraftBySlug('courses', slug)
    : await findOneBySlug('courses', slug)
  if (!course) notFound()

  const relatedResult = await findPublished('courses', {
    limit: 3,
    sort: '-publishedAt',
    where: {
      and: [
        { id: { not_equals: course.id } },
        {
          or: [
            { grade: { equals: course.grade } },
            { subject: { equals: course.subject } },
          ],
        },
      ],
    },
  })
  const payload = await getPayloadClient()
  const schedulesResult = await payload.find({
    collection: 'schedules',
    where: {
      and: [
        { course: { equals: course.id } },
        { status: { not_equals: 'da-ket-thuc' } },
      ],
    },
    sort: 'startDate',
    limit: 100,
    depth: 1,
  })
  const image = isMedia(course.featuredImage) ? course.featuredImage : null
  const branches = course.branches?.filter(isBranch) ?? []
  const documents = course.documents?.filter(isDocument) ?? []
  const relatedCourses = relatedResult.docs.filter((item) => item.id !== course.id)

  const courseSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || undefined,
    provider: { '@type': 'Organization', name: 'HANOI SMART EDU' },
  }).replace(/</g, '\\u003c')

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:text-orange-700" href="/">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link className="hover:text-orange-700" href="/khoa-hoc">Khóa học</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">{course.title}</li>
        </ol>
      </nav>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
          {gradeLabel(course.grade)}
        </span>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
          {subjectLabels[course.subject]}
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-blue-950 sm:text-5xl">
        {course.title}
      </h1>

      {image?.url ? (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl bg-slate-100">
          <Image
            alt={image.alt || course.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={image.url}
            unoptimized
          />
        </div>
      ) : null}

      {course.description ? (
        <p className="mt-8 text-lg leading-8 text-slate-700">{course.description}</p>
      ) : null}
      {course.content ? (
        <RichText className="prose prose-slate mt-8 max-w-none leading-8" data={course.content} />
      ) : null}
      {course.roadmap ? (
        <section className="mt-12 rounded-2xl bg-blue-50 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-blue-950">Lộ trình học</h2>
          <RichText className="prose prose-slate mt-5 max-w-none leading-8" data={course.roadmap} />
        </section>
      ) : null}

      <section className="mt-10 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <h2 className="font-bold text-blue-950">Lịch học</h2>
          <p className="mt-2 text-slate-600">{course.schedule || 'Liên hệ trung tâm để biết lịch học.'}</p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">Thời lượng</h2>
          <p className="mt-2 text-slate-600">{course.duration || 'Đang cập nhật'}</p>
        </div>
        <div>
          <h2 className="font-bold text-blue-950">Học phí</h2>
          <p className="mt-2 text-slate-600">
            {course.tuition == null ? 'Liên hệ để biết học phí' : formatTuition(course.tuition)}
          </p>
        </div>
        {course.audience ? (
          <div>
            <h2 className="font-bold text-blue-950">Đối tượng</h2>
            <p className="mt-2 text-slate-600">{course.audience}</p>
          </div>
        ) : null}
      </section>

      <section className="mt-12" aria-labelledby="course-schedules-title">
        <div className="mb-5 border-b border-slate-200 pb-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">
            {course.title}
          </p>
          <h2 className="mt-1 text-2xl font-black text-blue-950" id="course-schedules-title">
            {COURSE_SCHEDULE_LABELS.sectionTitle}
          </h2>
        </div>
        {schedulesResult.docs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {schedulesResult.docs.map((schedule) => {
              const currentStudents = schedule.currentStudents ?? 0
              const maxStudents = schedule.maxStudents ?? 20
              const progress = maxStudents > 0 ? Math.min(100, (currentStudents / maxStudents) * 100) : 0
              const isFull = schedule.status === 'da-day' || currentStudents >= maxStudents
              const location = isScheduleLocation(schedule.location) ? schedule.location : null
              const contactHref = `/lien-he?course=${encodeURIComponent(course.slug ?? slug)}&schedule=${schedule.id}`

              return (
                <article
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  key={schedule.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg font-extrabold text-blue-950">{schedule.title}</h3>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue-800">
                      {COURSE_SCHEDULE_LABELS.status[schedule.status]}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    {formatStartDate(schedule.startDate)}
                  </p>
                  <dl className="mt-3 space-y-2 text-sm text-slate-600">
                    <div>
                      <dt className="inline font-semibold text-slate-700">{COURSE_SCHEDULE_LABELS.details}: </dt>
                      <dd className="inline">{schedule.scheduleDetails || 'Đang cập nhật'}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-slate-700">{COURSE_SCHEDULE_LABELS.location}: </dt>
                      <dd className="inline">{location?.title || 'Đang cập nhật'}</dd>
                    </div>
                  </dl>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                      <span>{COURSE_SCHEDULE_LABELS.enrollment}</span>
                      <span>
                        {currentStudents}/{maxStudents} {COURSE_SCHEDULE_LABELS.students}
                      </span>
                    </div>
                    <div
                      aria-label={`${currentStudents}/${maxStudents} ${COURSE_SCHEDULE_LABELS.enrollment}`}
                      aria-valuemax={maxStudents}
                      aria-valuemin={0}
                      aria-valuenow={currentStudents}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                    >
                      <div
                        className={`h-full rounded-full ${isFull ? 'bg-slate-400' : 'bg-orange-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  {isFull ? (
                    <p className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-slate-100 px-4 text-sm font-bold text-slate-500">
                      {COURSE_SCHEDULE_LABELS.full}
                    </p>
                  ) : (
                    <Link
                      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                      href={contactHref}
                    >
                      {COURSE_SCHEDULE_LABELS.register}
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-600">
            {COURSE_SCHEDULE_LABELS.noSchedules}
          </p>
        )}
      </section>

      {branches.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-blue-950">Cơ sở mở lớp</h2>
          <ul className="mt-4 space-y-2">
            {branches.map((branch) => (
              <li key={branch.id}>
                <Link className="font-semibold text-blue-800 hover:text-orange-700" href="/co-so">
                  {branch.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-blue-950">Tài liệu liên quan</h2>
          <ul className="mt-4 space-y-3">
            {documents.map((document) => {
              const file = isMedia(document.file) ? document.file : null
              const href = file?.url || document.externalLink
              return href ? (
                <li key={document.id}>
                  <a className="font-semibold text-blue-800 underline underline-offset-2" href={href} download={file?.url ? true : undefined}>
                    {document.title}
                  </a>
                </li>
              ) : null
            })}
          </ul>
        </section>
      ) : null}

      {relatedCourses.length > 0 ? (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-blue-950">Khóa học liên quan</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCourses.map((relatedCourse) => (
              <CourseCard course={relatedCourse} key={relatedCourse.id} />
            ))}
          </div>
        </section>
      ) : null}

      <script dangerouslySetInnerHTML={{ __html: courseSchema }} type="application/ld+json" />
    </article>
  )
}
