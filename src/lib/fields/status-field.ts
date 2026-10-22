import type { SelectField } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

export const statusField: SelectField = {
  name: 'status',
  type: 'select',
  label: FIELD_LABELS.status.field,
  defaultValue: 'draft',
  options: [
    {
      label: FIELD_LABELS.status.draft,
      value: 'draft',
    },
    {
      label: FIELD_LABELS.status.published,
      value: 'published',
    },
  ],
}
