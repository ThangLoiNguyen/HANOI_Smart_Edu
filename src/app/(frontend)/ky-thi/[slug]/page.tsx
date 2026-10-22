import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ExamStatusBadge } from '@/components/exams/exam-status-badge'
import { formatDate } from '@/components/exams/exam-card'
import { RichText } from '@/components/layout/rich-text'
import { buildMetadata, buildStaticParams } from '@/lib/metadata'
import { findOneBySlug } from '@/lib/payload'
import type { Document, Exam, Media } from '@/payload-types'

export const revalidate = 3600

type ExamPageProps = {
  params: Promise<{ slug: string }>
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isDocument(value: number | Document): value is Document {
  return typeof value === 'object' && value !== null && 'title' in value
}

export async function generateStaticParams() {
  return buildStaticParams('exams')
}

export async function generateMetadata({ params }: ExamPageProps): Promise<Metadata> {
  const { slug } = await params
  const exam = await findOneBySlug('exams', slug)
  if (!exam) notFound()

  return buildMetadata({
    title: exam.seo?.metaTitle || exam.title,
    description: exam.seo?.metaDescription,
    image: exam.seo?.shareImage ?? exam.featuredImage,
    slug: `ky-thi/${slug}`,
  })
}

export default async function ExamDetailPage({ params }: ExamPageProps) {
  const { slug } = await params
  const exam = await findOneBySlug('exams', slug)
  if (!exam) notFound()

  const image = isMedia(exam.featuredImage) ? exam.featuredImage : null
  const resultFile = isMedia(exam.results?.file) ? exam.results.file : null
  const relatedDocuments = exam.relatedDocuments?.filter(isDocument) ?? []

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:text-orange-700" href="/">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link className="hover:text-orange-700" href="/ky-thi">Kỳ thi</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">{exam.title}</li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <ExamStatusBadge status={exam.examStatus} />
        <span className="text-sm font-bold text-slate-500">{exam.year}</span>
      </div>
      <h1 className="mt-4 text-3xl font-black leading-tight text-blue-950 sm:text-5xl">{exam.title}</h1>
      {image?.url ? (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl bg-slate-100">
          <Image alt={image.alt || exam.title} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 1024px" src={image.url} unoptimized />
        </div>
      ) : null}

      {exam.audience ? (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-blue-950">Đối tượng dự thi</h2>
          <p className="mt-3 leading-7 text-slate-700">{exam.audience}</p>
        </section>
      ) : null}
      {exam.rules ? (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-blue-950">Thể lệ</h2>
          <RichText className="prose prose-slate mt-4 max-w-none leading-8" data={exam.rules} />
        </section>
      ) : null}

      {exam.schedule?.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-blue-950">Lịch thi</h2>
          <ol className="mt-5 space-y-4 border-l-2 border-orange-200 pl-5">
            {exam.schedule.map((item, index) => (
              <li className="relative rounded-xl border border-slate-200 bg-white p-4" key={item.id || `${item.label}-${index}`}>
                <span aria-hidden="true" className="absolute -left-[1.65rem] top-5 h-3 w-3 rounded-full bg-orange-500" />
                <h3 className="font-bold text-blue-950">{item.label}</h3>
                <time className="mt-1 block text-sm text-slate-600" dateTime={item.datetime}>{formatDate(item.datetime)}</time>
                {item.location ? <p className="mt-1 text-sm text-slate-600">{item.location}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {exam.location ? (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-blue-950">Địa điểm</h2>
          <p className="mt-3 text-slate-700">{exam.location}</p>
        </section>
      ) : null}

      {resultFile?.url || exam.results?.description ? (
        <section className="mt-8 rounded-2xl bg-sky-50 p-6">
          <h2 className="text-2xl font-black text-blue-950">Kết quả</h2>
          {exam.results?.description ? <p className="mt-3 text-slate-700">{exam.results.description}</p> : null}
          {resultFile?.url ? (
            <a className="mt-4 inline-flex min-h-11 items-center font-bold text-blue-800 underline underline-offset-2" download href={resultFile.url}>
              Tải file kết quả
            </a>
          ) : null}
        </section>
      ) : null}

      {relatedDocuments.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-2xl font-black text-blue-950">Tài liệu liên quan</h2>
          <ul className="mt-4 space-y-3">
            {relatedDocuments.map((document) => {
              const file = isMedia(document.file) ? document.file : null
              const href = file?.url || document.externalLink
              return href ? <li key={document.id}><a className="font-semibold text-blue-800 underline underline-offset-2" download={file?.url ? true : undefined} href={href}>{document.title}</a></li> : null
            })}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
