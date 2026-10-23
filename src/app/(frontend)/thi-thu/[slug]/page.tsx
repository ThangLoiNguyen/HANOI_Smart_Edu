import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ExamPurchaseForm } from '@/components/exams/exam-purchase-form'
import { RichText } from '@/components/layout/rich-text'
import { buildMetadata, buildStaticParams, getSiteSettings } from '@/lib/metadata'
import { findOneBySlug, findPublished } from '@/lib/payload'
import type { Media } from '@/payload-types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export async function generateStaticParams() {
  return buildStaticParams('exams', 200)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const exam = await findOneBySlug('exams', slug)
  if (!exam) notFound()

  return buildMetadata({
    title: exam.title,
    description: exam.seo?.metaDescription || exam.audience || undefined,
    image: exam.featuredImage,
    slug: `thi-thu/${slug}`,
  })
}

export default async function PremiumExamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exam = await findOneBySlug('exams', slug)

  if (!exam) notFound()

  const siteSettings = exam.isPremium ? await getSiteSettings() : null

  const image = isMedia(exam.featuredImage) ? exam.featuredImage : null
  const related = (exam.relatedDocuments ?? []).filter((item): item is number => typeof item === 'number')
  const documents = related.length
    ? await findPublished('documents', { where: { id: { in: related } }, limit: 50, pagination: false })
    : { docs: [] }

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:text-orange-700" href="/">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link className="hover:text-orange-700" href="/thi-thu">Đề thi thử</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-700">{exam.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              {exam.isPremium ? 'Premium' : 'Miễn phí'}
            </span>
            <span className="text-sm font-bold text-slate-500">{exam.year}</span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight text-blue-950 sm:text-5xl">{exam.title}</h1>

          {image?.url ? (
            <div className="relative mt-8 overflow-hidden rounded-2xl bg-slate-100">
              <div className="relative aspect-video">
                <Image alt={image.alt || exam.title} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 768px" src={image.url} unoptimized />
              </div>
            </div>
          ) : null}

          {exam.audience ? (
            <section className="mt-8">
              <h2 className="text-2xl font-black text-blue-950">Đối tượng</h2>
              <p className="mt-3 leading-7 text-slate-700">{exam.audience}</p>
            </section>
          ) : null}

          {exam.durationMinutes ? (
            <section className="mt-8">
              <h2 className="text-2xl font-black text-blue-950">Nội dung đề thi</h2>
              <p className="mt-3 leading-7 text-slate-700">
                Đề gồm các câu hỏi trắc nghiệm, thời gian làm bài {exam.durationMinutes} phút.
                {exam.isPremium ? ' Nội dung sẽ mở sau khi giao dịch được xác nhận.' : ' Bạn có thể bắt đầu làm bài miễn phí ngay.'}
              </p>
            </section>
          ) : null}

          {exam.rules ? (
            <section className="mt-8">
              <h2 className="text-2xl font-black text-blue-950">Thể lệ</h2>
              <div className="mt-4">
                <RichText className="prose prose-slate max-w-none leading-8" data={exam.rules} />
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-orange-600">
              {exam.isPremium ? 'Giá đề thi' : 'Đề thi miễn phí'}
            </p>
            <div className="mt-3 text-3xl font-black text-blue-950">
              {exam.isPremium ? formatCurrency(Number(exam.price ?? 0)) : '0 ₫'}
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              {exam.schedule?.length ? (
                <p>
                  <span className="font-bold text-slate-800">Lịch thi:</span> {exam.schedule.map((item) => item.label).join(', ')}
                </p>
              ) : null}
              {exam.location ? <p><span className="font-bold text-slate-800">Địa điểm:</span> {exam.location}</p> : null}
            </div>
          </div>

          {exam.isPremium ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-blue-950">Thanh toán</h2>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-bold text-slate-900">Thông tin chuyển khoản</p>
                <ul className="mt-3 space-y-2">
                  <li><span className="font-semibold">Ngân hàng:</span> {siteSettings?.bankInfo?.bankId || 'Chưa cập nhật'}</li>
                  <li><span className="font-semibold">Số tài khoản:</span> {siteSettings?.bankInfo?.accountNo || 'Chưa cập nhật'}</li>
                  <li><span className="font-semibold">Chủ tài khoản:</span> {siteSettings?.bankInfo?.accountName || 'Chưa cập nhật'}</li>
                </ul>
              </div>
              <div className="mt-4">
                <ExamPurchaseForm examId={exam.id} price={Number(exam.price ?? 0)} examSlug={slug} />
              </div>
            </div>
          ) : (
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-500"
              href={`/thi-thu/${slug}/lam-bai`}
            >
              Làm bài ngay
            </Link>
          )}
        </aside>
      </div>

      {documents.docs.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-blue-950">Tài liệu liên quan</h2>
          <ul className="mt-4 space-y-3">
            {documents.docs.map((document) => (
              <li key={document.id}>
                <Link className="font-semibold text-blue-800 underline underline-offset-2" href={`/tai-lieu/${document.level}/${document.grade}/${document.category}`}>
                  {document.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
