import type { CollectionConfig } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

function isAdmin(user: unknown): boolean {
  return (
    typeof user === 'object' &&
    user !== null &&
    'role' in user &&
    user.role === 'admin'
  )
}

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req }) => {
      if (isAdmin(req.user)) {
        return true
      }

      if (req.user?.id === undefined) {
        return false
      }

      return {
        id: {
          equals: req.user.id,
        },
      }
    },
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      label: FIELD_LABELS.users.role,
      options: [
        { label: FIELD_LABELS.users.admin, value: 'admin' },
        { label: FIELD_LABELS.users.editor, value: 'editor' },
      ],
      required: true,
      // First user created via /admin must be admin, otherwise no one can manage staff.
      defaultValue: 'admin',
      saveToJWT: true,
    },
  ],
}

export default Users
