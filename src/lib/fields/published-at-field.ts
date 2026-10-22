import type { DateField, FieldHook } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

type PublishedDocument = {
  id: number | string
  publishedAt?: string | null
  status?: 'draft' | 'published'
}

type PublishedSiblings = {
  status?: 'draft' | 'published'
}

const setPublishedAt: FieldHook<
  PublishedDocument,
  string | null | undefined,
  PublishedSiblings
> = ({ originalDoc, siblingData, value }) => {
  const status = siblingData.status
  const isFirstPublication = status === 'published' && originalDoc?.status !== 'published'

  if (isFirstPublication && !originalDoc?.publishedAt) {
    return new Date().toISOString()
  }

  return value ?? originalDoc?.publishedAt
}

export const publishedAtField: DateField = {
  name: 'publishedAt',
  type: 'date',
  label: FIELD_LABELS.publishedAt,
  hooks: {
    beforeChange: [setPublishedAt],
  },
}
