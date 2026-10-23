'use server'

import { getPayloadClient } from '@/lib/payload'

const vietnamesePhonePattern = /^(?:\+?84|0)[\s.-]?\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ExamPurchaseResult = {
  success: boolean
  message: string
  redirectUrl?: string
  transactionId?: number
}

export type ExamAccessStatus = {
  allowed: boolean
  message: string
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, '')
}

export async function createExamPurchase(formData: FormData): Promise<ExamPurchaseResult> {
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' ? honeypot.trim() : honeypot !== null) {
    return { success: false, message: 'Thông tin không hợp lệ.' }
  }

  const examIdInput = getString(formData, 'examId')
  const studentName = getString(formData, 'studentName')
  const studentPhone = getString(formData, 'studentPhone')
  const studentEmail = getString(formData, 'studentEmail')
  const transferNote = getString(formData, 'transferNote')
  const rawPaymentMethod = getString(formData, 'paymentMethod') || 'chuyen-khoan'
  const paymentMethod: 'chuyen-khoan' | 'vietqr' | 'khac' =
    rawPaymentMethod === 'chuyen-khoan' || rawPaymentMethod === 'vietqr' || rawPaymentMethod === 'khac'
      ? rawPaymentMethod
      : 'chuyen-khoan'

  if (!/^\d+$/.test(examIdInput)) {
    return { success: false, message: 'Đề thi không hợp lệ.' }
  }

  const examId = Number(examIdInput)
  const phone = normalizePhone(studentPhone)

  if (!studentName || studentName.length < 2 || studentName.length > 100) {
    return { success: false, message: 'Vui lòng nhập họ tên hợp lệ.' }
  }

  if (!phone || !vietnamesePhonePattern.test(phone)) {
    return { success: false, message: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ.' }
  }

  if (studentEmail && !emailPattern.test(studentEmail)) {
    return { success: false, message: 'Vui lòng nhập email hợp lệ.' }
  }

  if (!['chuyen-khoan', 'vietqr', 'khac'].includes(paymentMethod)) {
    return { success: false, message: 'Phương thức thanh toán không hợp lệ.' }
  }

  try {
    const payload = await getPayloadClient()
    const exam = await payload.findByID({
      collection: 'exams',
      id: examId,
      overrideAccess: true,
    })

    if (!exam || exam.status !== 'published' || exam.isPremium !== true) {
      return { success: false, message: 'Đề thi thử này hiện không còn mở bán.' }
    }

    const amount = typeof exam.price === 'number' ? Number(exam.price) : 0
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, message: 'Đề thi thử chưa có giá bán hợp lệ.' }
    }

    const existing = await payload.find({
      collection: 'transactions',
      where: {
        and: [
          { exam: { equals: examId } },
          { studentPhone: { equals: phone } },
          {
            status: { in: ['cho-xac-nhan', 'da-thanh-toan', 'da-mo-khoa'] },
          },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      return {
        success: false,
        message: 'Bạn đã đăng ký đề thi này trước đó. Vui lòng chờ xác nhận hoặc liên hệ trung tâm.',
      }
    }

    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        studentName,
        studentPhone: phone,
        studentEmail: studentEmail || null,
        exam: examId,
        amount,
        paymentMethod,
        transferNote: transferNote || null,
        status: 'cho-xac-nhan',
      },
      overrideAccess: true,
    })

    const redirectUrl = `/thi-thu/${exam.slug}/lam-bai?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(studentEmail || '')}`
    const transactionId = typeof transaction.id === 'number' ? transaction.id : Number(transaction.id)

    return {
      success: true,
      message: 'Đăng ký đề thi thử thành công. Chúng tôi sẽ xác nhận thanh toán trong thời gian sớm nhất.',
      redirectUrl,
      transactionId,
    }
  } catch {
    return { success: false, message: 'Không thể tạo yêu cầu thanh toán. Vui lòng thử lại sau.' }
  }
}

export async function getExamAccessStatus(
  examId: number,
  phone: string,
  email?: string,
): Promise<ExamAccessStatus> {
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone || !vietnamesePhonePattern.test(normalizedPhone)) {
    return { allowed: false, message: 'Số điện thoại không hợp lệ.' }
  }

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'transactions',
      where: {
        and: [
          { exam: { equals: examId } },
          { studentPhone: { equals: normalizedPhone } },
          { status: { in: ['da-thanh-toan', 'da-mo-khoa'] } },
          ...(email
            ? [{ studentEmail: { equals: email.trim() || null } }]
            : []),
        ],
      },
      limit: 1,
      sort: '-createdAt',
      overrideAccess: true,
    })

    if (result.docs.length === 0) {
      return { allowed: false, message: 'Bạn chưa hoàn tất thanh toán hoặc chưa được kích hoạt đề thi.' }
    }

    return { allowed: true, message: 'Đề thi đã được mở khóa.' }
  } catch {
    return { allowed: false, message: 'Không thể xác minh quyền truy cập. Vui lòng liên hệ trung tâm.' }
  }
}
