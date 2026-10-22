import type { Access, CollectionConfig } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import type { User } from '@/payload-types'

function hasMediaAccess(user: User | null | undefined): boolean {
  return user?.role === 'admin' || user?.role === 'editor'
}

const staffAccess: Access = ({ req }) => hasMediaAccess(req.user)

const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: staffAccess,
    update: staffAccess,
    delete: staffAccess,
  },
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
      },
      {
        name: 'card',
        width: 600,
        height: 400,
      },
      {
        name: 'hero',
        width: 1600,
        height: 900,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: FIELD_LABELS.media.alt,
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: FIELD_LABELS.media.caption,
    },
  ],
}

export default Media
