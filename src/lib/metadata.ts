import 'server-only'

import { cache } from 'react'
import type { Metadata } from 'next'
import type { Media, SiteSetting } from '@/payload-types'
import { findPublished, getGlobal } from '@/lib/payload'
import type { PublishedCollectionSlug } from '@/lib/payload'

type MetadataInput = {
  title?: string | null
  description?: string | null
  image?: string | Media | number | null
  slug?: string | null
}

function getImageUrl(image: MetadataInput['image']): string | undefined {
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image !== null && 'url' in image) {
    return image.url ?? undefined
  }
  return undefined
}

export async function buildMetadata(input: MetadataInput = {}): Promise<Metadata> {
  const settings = await getSiteSettings()
  const defaultSeo = settings.defaultSeo
  const finalTitle = input.title || defaultSeo?.metaTitle || settings.siteName || 'Trung tâm'
  const finalDescription = input.description || defaultSeo?.metaDescription || ''
  const finalImage =
    getImageUrl(input.image) ?? getImageUrl(defaultSeo?.shareImage)
  const url = input.slug ? `/${input.slug.replace(/^\/+/, '')}` : '/'

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      images: finalImage ? [{ url: finalImage }] : undefined,
      url,
      type: 'website',
      locale: 'vi_VN',
    },
    twitter: {
      card: finalImage ? 'summary_large_image' : 'summary',
      title: finalTitle,
      description: finalDescription,
      images: finalImage ? [finalImage] : undefined,
    },
  }
}

export async function buildStaticParams(collection: PublishedCollectionSlug, limit = 100) {
  const result = await findPublished(collection, { limit, pagination: false })
  return result.docs.flatMap((doc) =>
    'slug' in doc && typeof doc.slug === 'string' ? [{ slug: doc.slug }] : [],
  )
}

export const getSiteSettings = cache(
  async (): Promise<SiteSetting> => getGlobal('siteSettings'),
)
