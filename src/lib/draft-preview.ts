import 'server-only'

import { headers } from 'next/headers'
import { createLocalReq } from 'payload'

import { getPayloadClient } from '@/lib/payload'

export type DraftCollectionSlug =
  | 'posts'
  | 'courses'
  | 'exams'
  | 'admissions'
  | 'achievements'
  | 'albums'
  | 'pages'

export async function findDraftBySlug<TCollection extends DraftCollectionSlug>(
  collection: TCollection,
  slug: string,
) {
  const requestHeaders = await headers()
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null
  }

  const req = await createLocalReq({ req: { headers: requestHeaders }, user }, payload)
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    overrideAccess: false,
    req,
  })

  return result.docs[0] ?? null
}
