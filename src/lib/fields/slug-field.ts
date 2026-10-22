import type { FieldHook, TextField } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

type SlugDocument = {
  id: number | string
  title?: string
}

type SlugSiblings = {
  title?: string
}

const slugifyTitle = (title: string | undefined): string | undefined => {
  if (!title) {
    return undefined
  }

  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\u0111/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || undefined
}

const generateSlug: FieldHook<SlugDocument, string | null | undefined, SlugSiblings> = ({
  siblingData,
  value,
}) => {
  // Keep manually supplied slugs stable; derive only when the field is blank.
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return slugifyTitle(siblingData.title)
}

export const slugField: TextField = {
  name: 'slug',
  type: 'text',
  label: FIELD_LABELS.slug,
  unique: true,
  hooks: {
    beforeValidate: [generateSlug],
  },
}
