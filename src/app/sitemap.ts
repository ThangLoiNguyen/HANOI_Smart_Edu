import type { MetadataRoute } from 'next'

import { findPublished } from '@/lib/payload'
import type { PublishedCollectionSlug } from '@/lib/payload'

const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
const batchSize = 1000

const staticEntries: MetadataRoute.Sitemap = [
  { url: `${baseUrl}/`, priority: 1, changeFrequency: 'daily' },
  { url: `${baseUrl}/gioi-thieu`, priority: 0.8, changeFrequency: 'monthly' },
  { url: `${baseUrl}/khoa-hoc`, priority: 0.9, changeFrequency: 'weekly' },
  { url: `${baseUrl}/tuyen-sinh`, priority: 0.9, changeFrequency: 'weekly' },
  { url: `${baseUrl}/thanh-tich`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${baseUrl}/tai-lieu`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${baseUrl}/ky-thi`, priority: 0.8, changeFrequency: 'weekly' },
  { url: `${baseUrl}/tin-tuc`, priority: 0.9, changeFrequency: 'daily' },
  { url: `${baseUrl}/album`, priority: 0.7, changeFrequency: 'weekly' },
  { url: `${baseUrl}/co-so`, priority: 0.7, changeFrequency: 'monthly' },
  { url: `${baseUrl}/lien-he`, priority: 0.6, changeFrequency: 'monthly' },
]

const dynamicCollections: {
  collection: PublishedCollectionSlug
  path: (slug: string) => string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  excludeSlugs?: string[]
}[] = [
  { collection: 'posts', path: (slug) => `/tin-tuc/${slug}`, changeFrequency: 'daily' },
  { collection: 'courses', path: (slug) => `/khoa-hoc/${slug}`, changeFrequency: 'weekly' },
  { collection: 'exams', path: (slug) => `/ky-thi/${slug}`, changeFrequency: 'weekly' },
  { collection: 'admissions', path: (slug) => `/tuyen-sinh/${slug}`, changeFrequency: 'weekly' },
  { collection: 'achievements', path: (slug) => `/thanh-tich/${slug}`, changeFrequency: 'monthly' },
  { collection: 'albums', path: (slug) => `/album/${slug}`, changeFrequency: 'monthly' },
  {
    collection: 'pages',
    path: (slug) => `/${slug}`,
    changeFrequency: 'monthly',
    excludeSlugs: ['lien-he', 'gioi-thieu'],
  },
]

async function findAllPublished(collection: PublishedCollectionSlug) {
  const firstPage = await findPublished(collection, {
    page: 1,
    limit: batchSize,
    sort: 'id',
  })
  if (firstPage.totalPages <= 1) return firstPage.docs

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      findPublished(collection, { page: index + 2, limit: batchSize, sort: 'id' }),
    ),
  )
  return [...firstPage.docs, ...remainingPages.flatMap(({ docs }) => docs)]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collections = await Promise.all(
    dynamicCollections.map(async ({ collection, path, changeFrequency, excludeSlugs }) => {
      const docs = await findAllPublished(collection)
      return docs.flatMap((doc) => {
        if (!('slug' in doc) || typeof doc.slug !== 'string' || excludeSlugs?.includes(doc.slug)) {
          return []
        }

        const lastModified =
          'updatedAt' in doc && typeof doc.updatedAt === 'string'
            ? doc.updatedAt
            : 'publishedAt' in doc && typeof doc.publishedAt === 'string'
              ? doc.publishedAt
              : undefined

        return [
          {
            url: `${baseUrl}${path(doc.slug)}`,
            lastModified,
            changeFrequency,
          },
        ]
      })
    }),
  )

  const postsFirstPage = await findPublished('posts', { page: 1, limit: 10 })
  const paginationEntries: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, postsFirstPage.totalPages - 1) },
    (_, index) => ({
      url: `${baseUrl}/tin-tuc/trang/${index + 2}`,
      priority: 0.5,
      changeFrequency: 'weekly',
    }),
  )

  return [...staticEntries, ...collections.flat(), ...paginationEntries]
}
