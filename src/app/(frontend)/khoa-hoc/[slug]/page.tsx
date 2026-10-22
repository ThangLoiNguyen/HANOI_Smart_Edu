import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { CourseCard, formatTuition, gradeLabel, subjectLabels } from '@/components/courses/course-card'
import { RichText } from '@/components/layout/rich-text'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug, findPublished } from '@/lib/payload'
import type { Branch, Course, Document, Media } from '@/payload-types'

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

export async function generateStaticParams() {
  return buildStaticParams('courses')
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await findOneBySlug('courses', slug)
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
  const course = await findOneBySlug('courses', slug)
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
