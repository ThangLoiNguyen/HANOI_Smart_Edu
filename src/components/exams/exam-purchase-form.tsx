'use client'

import { useState } from 'react'

import { createExamPurchase } from '@/app/actions/exam-purchase'

type ExamPurchaseFormProps = {
  examId: number
  price: number
  examSlug: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export function ExamPurchaseForm({ examId, price, examSlug }: ExamPurchaseFormProps) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('idle')
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const result = await createExamPurchase(formData)

    if (!result.success) {
      setStatus('error')
      setMessage(result.message)
      setIsSubmitting(false)
      return
    }

    setStatus('success')
    setMessage(result.message)
    setRedirectUrl(result.redirectUrl ?? `/thi-thu/${examSlug}/lam-bai`)
    setIsSubmitting(false)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <input name="website" style={{ display: 'none' }} tabIndex={-1} type="text" />
      <input name="examId" type="hidden" value={String(examId)} />
      <input name="paymentMethod" type="hidden" value="chuyen-khoan" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Họ và tên học sinh
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400"
            name="studentName"
            placeholder="Nhập họ và tên"
            required
            type="text"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Số điện thoại
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400"
            name="studentPhone"
            placeholder="Ví dụ: 0987654321"
            required
            type="tel"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold text-slate-700">
        Email (nếu có)
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400"
          name="studentEmail"
          placeholder="name@example.com"
          type="email"
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Ghi chú chuyển khoản
        <textarea
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-400"
          name="transferNote"
          placeholder="Ví dụ: Đề thi thử Toán 9 Premium"
        />
      </label>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold">Tổng tiền cần thanh toán</span>
          <span className="text-lg font-black">{formatCurrency(price)}</span>
        </div>
      </div>

      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-orange-200"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký mua đề thi'}
      </button>

      {message ? (
        <div
          className={status === 'success' ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700' : 'rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'}
        >
          <p>{message}</p>
          {status === 'success' && redirectUrl ? (
            <a className="mt-3 inline-flex font-bold underline underline-offset-2" href={redirectUrl}>
              Tiếp tục vào trang làm bài
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
