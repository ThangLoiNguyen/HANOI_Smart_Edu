import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

const previewPaths = {
  posts: '/tin-tuc',
  courses: '/khoa-hoc',
  exams: '/ky-thi',
  admissions: '/tuyen-sinh',
  achievements: '/thanh-tich',
  albums: '/album',
  pages: '',
} as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')
  const slug = searchParams.get('slug')
  const secret = searchParams.get('secret')

  if (
    !collection ||
    !Object.hasOwn(previewPaths, collection) ||
    !slug ||
    slug === '.' ||
    slug === '..' ||
    slug.length > 200 ||
    /[\/\\\u0000-\u001f]/.test(slug) ||
    !secret
  ) {
    return NextResponse.json({ message: 'Invalid preview request.' }, { status: 400 })
  }

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const pathPrefix = previewPaths[collection as keyof typeof previewPaths]
  const destination = `${pathPrefix}/${encodeURIComponent(slug)}`
  ;(await draftMode()).enable()

  return NextResponse.redirect(new URL(destination, request.url), 307)
}
