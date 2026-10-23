'use server'

import { randomInt } from 'node:crypto'
import { headers } from 'next/headers'

import { CONTACT_LABELS } from '@/lib/labels'
import { getPayloadClient } from '@/lib/payload'
import type { PlacementQuestion } from '@/payload-types'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_REQUESTS = 3
const submissionsByIp = new Map<string, number[]>()
const vietnamesePhonePattern = /^(\+?84|0)[\s.-]?\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SubmitContactResult = {
  success: boolean
  message?: string
}

export type PlacementQuestionForTest = Pick<
  PlacementQuestion,
  'id' | 'topic' | 'question' | 'hint' | 'difficulty'
> & { answers: string[] }

type PlacementQuestionLoadResult =
  | { success: true; questions: PlacementQuestionForTest[] }
  | { success: false; questions: []; message: string }

type PlacementAnswerResult =
  | { success: true; correct: boolean; correctAnswerIndex: number; explanation: string }
  | { success: false; message: string }

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
  const scheduleId = getRelationshipId(getString(formData, 'scheduleId'))

  if (
    !fullName ||
    fullName.length > 100 ||
    !phone ||
    !vietnamesePhonePattern.test(phone) ||
    (email !== '' && !isValidEmail(email)) ||
    message.length > 2000 ||
    interestedCourse === false ||
    branch === false ||
    scheduleId === false
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
    if (scheduleId !== null) {
      if (interestedCourse === null) {
        return { success: false, message: CONTACT_LABELS.validationError }
      }

      const schedule = await payload.findByID({
        collection: 'schedules',
        id: scheduleId,
        overrideAccess: false,
      })
      const scheduleCourseId =
        typeof schedule.course === 'object' && schedule.course !== null
          ? schedule.course.id
          : schedule.course
      if (
        scheduleCourseId !== interestedCourse ||
        schedule.status === 'da-day'
      ) {
        return { success: false, message: CONTACT_LABELS.validationError }
      }
    }

    await payload.create({
      collection: 'submissions',
      data: {
        fullName,
        phone,
        email: email || null,
        message: message || null,
        interestedCourse,
        branch,
        scheduleId,
      },
      overrideAccess: false,
    })
  } catch {
    return { success: false, message: CONTACT_LABELS.genericError }
  }

  return { success: true }
}

export async function submitPlacementTest(formData: FormData): Promise<SubmitContactResult> {
  const website = formData.get('website')
  if (typeof website === 'string' ? website.trim() : website !== null) {
    return { success: false }
  }

  const fullName = getString(formData, 'fullName')
  const phone = getString(formData, 'phone')
  const resultMessage = getString(formData, 'message')
  if (
    !fullName ||
    fullName.length > 100 ||
    !phone ||
    !vietnamesePhonePattern.test(phone) ||
    !resultMessage ||
    resultMessage.length > 2000
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
        message: `Đăng ký test đầu vào\n${resultMessage}`,
      },
      overrideAccess: false,
    })
  } catch {
    return { success: false, message: CONTACT_LABELS.genericError }
  }

  return { success: true }
}

export async function getPlacementQuestions(): Promise<PlacementQuestionLoadResult> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'placement-questions',
      limit: 500,
      pagination: false,
      overrideAccess: true,
    })

    const availableQuestions = result.docs.filter(
      (question) =>
        question.answers.length >= 2 &&
        question.answers.length <= 4 &&
        question.correctAnswerIndex >= 0 &&
        question.correctAnswerIndex < question.answers.length,
    )
    if (availableQuestions.length < 10) {
      return { success: false, questions: [], message: 'insufficient-questions' }
    }

    const shuffled = [...availableQuestions]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = randomInt(index + 1)
      ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
    }

    return {
      success: true,
      questions: shuffled.slice(0, 10).map((question) => ({
        id: question.id,
        topic: question.topic,
        question: question.question,
        answers: question.answers.map((answer) => answer.answer),
        hint: question.hint,
        difficulty: question.difficulty ?? 'de',
      })),
    }
  } catch {
    return { success: false, questions: [], message: 'load-failed' }
  }
}

export async function checkPlacementAnswer(
  questionId: number,
  selectedAnswerIndex: number,
): Promise<PlacementAnswerResult> {
  if (
    !Number.isSafeInteger(questionId) ||
    questionId <= 0 ||
    !Number.isInteger(selectedAnswerIndex) ||
    selectedAnswerIndex < 0
  ) {
    return { success: false, message: CONTACT_LABELS.validationError }
  }

  try {
    const payload = await getPayloadClient()
    const question = await payload.findByID({
      collection: 'placement-questions',
      id: questionId,
      overrideAccess: true,
    })
    if (
      selectedAnswerIndex >= question.answers.length ||
      question.correctAnswerIndex >= question.answers.length
    ) {
      return { success: false, message: CONTACT_LABELS.validationError }
    }

    return {
      success: true,
      correct: selectedAnswerIndex === question.correctAnswerIndex,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation || '',
    }
  } catch {
    return { success: false, message: CONTACT_LABELS.genericError }
  }
}

// TODO: khi deploy production nhiều instance, thay Map in-memory bằng Upstash Redis hoặc Vercel KV.
