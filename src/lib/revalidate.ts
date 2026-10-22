import { revalidatePath, revalidateTag } from 'next/cache'

const collectionTagPrefixes: Record<string, string> = {
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

const homepageCollections = new Set([
  'posts',
  'courses',
  'admissions',
  'achievements',
  'exams',
  'albums',
])

const siteCollections = new Set(['siteSettings', 'navigation', 'branches'])

function uniqueSlugs(slug?: string | null, previousSlug?: string | null): string[] {
  return [...new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))]
}

function revalidateCollectionPaths(paths: string[], slugs: string[]): void {
  for (const path of paths) {
    if (path.includes('[slug]')) {
      if (slugs.length === 0) {
        revalidatePath(path, 'page')
      } else {
        for (const slug of slugs) {
          revalidatePath(path.replace('[slug]', slug))
        }
      }
    } else if (path.includes('[')) {
      revalidatePath(path, 'page')
    } else {
      revalidatePath(path, 'page')
    }
  }
}

export function revalidateCollection(
  collection: string,
  slug: string | null | undefined,
  previousSlug: string | null | undefined,
  paths: string[],
): void {
  const slugs = uniqueSlugs(slug, previousSlug)

  // Paths refresh generated pages; tags refresh cached data shared across routes.
  revalidateCollectionPaths(paths, slugs)
  const tags = new Set([collection])

  if (homepageCollections.has(collection) || collection === 'homepage') {
    tags.add('homepage')
  }

  if (siteCollections.has(collection)) {
    tags.add('site')
  }

  if (collection === 'branches') {
    tags.add('branches')
  }

  const tagPrefix = collectionTagPrefixes[collection]
  if (tagPrefix) {
    for (const currentSlug of slugs) {
      tags.add(`${tagPrefix}:${currentSlug}`)
    }
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }
}

export function revalidatePost(
  slug: string | null | undefined,
  previousSlug?: string | null,
): void {
  revalidateCollection('posts', slug, previousSlug, [
    '/',
    '/tin-tuc',
    '/tin-tuc/trang/[n]',
    '/tin-tuc/[slug]',
    '/sitemap.xml',
  ])
}
