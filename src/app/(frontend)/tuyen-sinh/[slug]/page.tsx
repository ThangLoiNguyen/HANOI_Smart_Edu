import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { AdmissionStatusBadge } from '@/components/admissions/admission-status-badge'
import { formatDate } from '@/components/admissions/admission-card'
import { RichText } from '@/components/layout/rich-text'
import { findDraftBySlug } from '@/lib/draft-preview'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug } from '@/lib/payload'
import type { Admission, Course, Media } from '@/payload-types'

export const revalidate = 3600

type AdmissionPageProps = {
  params: Promise<{ slug: string }>
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isCourse(value: number | Course): value is Course {
  return typeof value === 'object' && value !== null && 'title' in value
}

export async function generateStaticParams() {
  return buildStaticParams('admissions')
}

export async function generateMetadata({ params }: AdmissionPageProps): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const admission = isDraft
    ? await findDraftBySlug('admissions', slug)
    : await findOneBySlug('admissions', slug)
  if (!admission) notFound()

  return buildMetadata({
    title: admission.seo?.metaTitle || admission.title,
    description: admission.seo?.metaDescription,
    image: admission.seo?.shareImage ?? admission.featuredImage,
    slug: `tuyen-sinh/${slug}`,
  })
}

export default async function AdmissionDetailPage({ params }: AdmissionPageProps) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const admission = isDraft
    ? await findDraftBySlug('admissions', slug)
    : await findOneBySlug('admissions', slug)
  if (!admission) notFound()

  const image = isMedia(admission.featuredImage) ? admission.featuredImage : null
  const courses = admission.relatedCourses?.filter(isCourse) ?? []
  const attachments = admission.attachments?.filter(isMedia) ?? []
  const isExpired = new Date(admission.deadline).getTime() < Date.now()
  const isClosed = admission.admissionStatus === 'da-dong' || isExpired

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:text-orange-700" href="/">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link className="hover:text-orange-700" href="/tuyen-sinh">Tuyển sinh</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">{admission.title}</li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <AdmissionStatusBadge status={admission.admissionStatus} />
        <time className="text-sm text-slate-500" dateTime={admission.deadline}>
          Hạn đăng ký: {formatDate(admission.deadline)}
        </time>
      </div>
      <h1 className="mt-4 text-3xl font-black leading-tight text-blue-950 sm:text-5xl">{admission.title}</h1>
      {isClosed ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-800">
          Đã hết hạn đăng ký
        </p>
      ) : null}
      {image?.url ? (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl bg-slate-100">
          <Image alt={image.alt || admission.title} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 1024px" src={image.url} unoptimized />
        </div>
      ) : null}
      {admission.content ? (
        <RichText className="prose prose-slate mt-8 max-w-none leading-8" data={admission.content} />
      ) : null}

      {courses.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-blue-950">Khóa học liên quan</h2>
          <ul className="mt-4 space-y-3">
            {courses.map((course) => (
              <li key={course.id}>
                <Link className="font-semibold text-blue-800 underline underline-offset-2" href={course.slug ? `/khoa-hoc/${course.slug}` : '/khoa-hoc'}>
                  {course.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {attachments.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-blue-950">Tài liệu đính kèm</h2>
          <ul className="mt-4 space-y-3">
            {attachments.map((attachment) => attachment.url ? (
              <li key={attachment.id}>
                <a className="font-semibold text-blue-800 underline underline-offset-2" download href={attachment.url}>
                  {attachment.caption || attachment.filename || attachment.alt}
                </a>
              </li>
            ) : null)}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
