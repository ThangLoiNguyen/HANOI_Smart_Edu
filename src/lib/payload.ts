import 'server-only'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import type { GlobalSlug, Payload, Where } from 'payload'

import config from '@/payload.config'
import type { Course, Document, Exam, Post } from '@/payload-types'

let payloadClientPromise: Promise<Payload> | undefined

export function getPayloadClient(): Promise<Payload> {
  if (!payloadClientPromise) {
    payloadClientPromise = getPayload({ config })
  }

  return payloadClientPromise
}

export type PublishedFindOptions = {
  depth?: number
  limit?: number
  page?: number
  pagination?: boolean
  sort?: string
  where?: Where
}

export type PublishedCollectionSlug =
  | 'posts'
  | 'courses'
  | 'admissions'
  | 'achievements'
  | 'documents'
  | 'exams'
  | 'albums'
  | 'pages'
  | 'branches'

const tagPrefixes: Partial<Record<PublishedCollectionSlug, string>> = {
  posts: 'post',
  courses: 'course',
  admissions: 'admission',
  achievements: 'achievement',
  documents: 'document',
  exams: 'exam',
  albums: 'album',
  pages: 'page',
  branches: 'branch',
}

function getSlugEquals(where: Where | undefined): string | undefined {
  if (!where || !('slug' in where)) {
    return undefined
  }

  const slugFilter = where.slug
  if (typeof slugFilter !== 'object' || slugFilter === null || !('equals' in slugFilter)) {
    return undefined
  }

  return typeof slugFilter.equals === 'string' ? slugFilter.equals : undefined
}

export async function findPublished<TSlug extends PublishedCollectionSlug>(
  collection: TSlug,
  options: PublishedFindOptions = {},
) {
  const slug = getSlugEquals(options.where)
  // Tags match revalidateCollection's collection and singular resource tags.
  const tags = new Set<string>([collection])
  const tagPrefix = tagPrefixes[collection]
  if (slug) {
    tags.add(`${collection}:${slug}`)
    if (tagPrefix) tags.add(`${tagPrefix}:${slug}`)
  }

  const cacheKey = JSON.stringify({
    collection,
    depth: options.depth ?? 2,
    limit: options.limit,
    page: options.page,
    pagination: options.pagination,
    sort: options.sort,
    where: options.where,
  })

  const findCached = unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection,
        where: {
          and: [{ status: { equals: 'published' } }, ...(options.where ? [options.where] : [])],
        },
        depth: options.depth ?? 2,
        limit: options.limit,
        page: options.page,
        pagination: options.pagination,
        sort: options.sort,
      })
    },
    ['payload-published-find', cacheKey],
    { tags: [...tags] },
  )

  const result = await findCached()
  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
  }
}

export async function findOneBySlug<TSlug extends PublishedCollectionSlug>(
  collection: TSlug,
  slug: string,
) {
  const result = await findPublished(collection, {
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return result.docs[0] ?? null
}

export async function getGlobal<TSlug extends GlobalSlug>(slug: TSlug) {
  const getCachedGlobal = unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug, depth: 2 })
    },
    ['payload-global', slug],
    { tags: [slug, 'site'] },
  )

  return getCachedGlobal()
}

export type SearchResults = {
  posts: Post[]
  courses: Course[]
  documents: Document[]
  exams: Exam[]
}

export async function searchContent(query: string): Promise<SearchResults> {
  const term = query.trim()
  if (!term) return { posts: [], courses: [], documents: [], exams: [] }

  const [posts, courses, documents, exams] = await Promise.all([
    findPublished('posts', {
      where: { or: [{ title: { like: term } }, { excerpt: { like: term } }] },
      limit: 100,
      pagination: false,
    }),
    findPublished('courses', {
      where: { or: [{ title: { like: term } }, { description: { like: term } }] },
      limit: 100,
      pagination: false,
    }),
    findPublished('documents', {
      where: { title: { like: term } },
      limit: 100,
      pagination: false,
    }),
    findPublished('exams', {
      where: { title: { like: term } },
      limit: 100,
      pagination: false,
    }),
  ])

  return {
    posts: posts.docs,
    courses: courses.docs,
    documents: documents.docs,
    exams: exams.docs,
  }
}
