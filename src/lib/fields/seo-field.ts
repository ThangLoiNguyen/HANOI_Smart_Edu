import { FIELD_LABELS } from '@/lib/fields/labels'

export const seoField = {
  name: 'seo',
  type: 'group' as const,
  label: FIELD_LABELS.seo.group,
  fields: [
    {
      name: 'metaTitle',
      type: 'text' as const,
      label: FIELD_LABELS.seo.metaTitle,
    },
    {
      name: 'metaDescription',
      type: 'textarea' as const,
      label: FIELD_LABELS.seo.metaDescription,
    },
    {
      name: 'shareImage',
      type: 'relationship' as const,
      relationTo: 'media' as const,
      label: FIELD_LABELS.seo.shareImage,
    },
  ],
}
