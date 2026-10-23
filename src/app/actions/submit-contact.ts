'use server'

import { headers } from 'next/headers'

import { CONTACT_LABELS } from '@/lib/labels'
import { getPayloadClient } from '@/lib/payload'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_REQUESTS = 3
const submissionsByIp = new Map<string, number[]>()
const vietnamesePhonePattern = /^(\+?84|0)[\s.-]?\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SubmitContactResult = {
  success: boolean
  message?: string
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getRelationshipId(value: string): number | null | false {
  if (!value) return null
  if (!/^\d+$/.test(value)) return false

  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : false
}

function isValidEmail(value: string): boolean {
  return value.length <= 200 && emailPattern.test(value)
}

function allowRequest(ip: string, now: number): boolean {
  for (const [key, timestamps] of submissionsByIp) {
    const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
    if (recentTimestamps.length === 0) {
      submissionsByIp.delete(key)
    } else {
      submissionsByIp.set(key, recentTimestamps)
    }
  }

  const timestamps = submissionsByIp.get(ip) ?? []
  if (timestamps.length >= RATE_LIMIT_REQUESTS) return false

  timestamps.push(now)
  submissionsByIp.set(ip, timestamps)
  return true
}

export async function submitContact(formData: FormData): Promise<SubmitContactResult> {
  const website = formData.get('website')
  if (typeof website === 'string' ? website.trim() : website !== null) {
    return { success: false }
  }

  const fullName = getString(formData, 'fullName')
  const phone = getString(formData, 'phone')
  const email = getString(formData, 'email')
  const message = getString(formData, 'message')
  const interestedCourse = getRelationshipId(getString(formData, 'interestedCourse'))
  const branch = getRelationshipId(getString(formData, 'branch'))

  if (
    !fullName ||
    fullName.length > 100 ||
    !phone ||
    !vietnamesePhonePattern.test(phone) ||
    !email ||
    !isValidEmail(email) ||
    message.length > 2000 ||
    interestedCourse === false ||
    branch === false
  ) {
    return { success: false, message: CONTACT_LABELS.validationError }
  }

  const requestHeaders = await headers()
  const forwardedIp = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = requestHeaders.get('x-real-ip')?.trim()
  const ip = forwardedIp || realIp || 'unknown'

  if (!allowRequest(ip, Date.now())) {
    return { success: false, message: CONTACT_LABELS.rateLimitError }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'submissions',
      data: {
        fullName,
        phone,
        email,
        message: message || null,
        interestedCourse,
        branch,
      },
      overrideAccess: false,
    })
  } catch {
    return { success: false, message: CONTACT_LABELS.genericError }
  }

  return { success: true }
}

// TODO: khi deploy production nhiều instance, thay Map in-memory bằng Upstash Redis hoặc Vercel KV.
