import type { Access, CollectionConfig } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { slugField } from '@/lib/fields/slug-field'

function isStaffUser(user: unknown): boolean {
  if (typeof user !== 'object' || user === null || !('role' in user)) {
    return false
  }

  return user.role === 'admin' || user.role === 'editor'
}

function isAdmin(user: unknown): boolean {
  return typeof user === 'object' && user !== null && 'role' in user && user.role === 'admin'
}

const staffAccess: Access = ({ req }) => isStaffUser(req.user)
const adminAccess: Access = ({ req }) => isAdmin(req.user)

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    defaultColumns: ['title', 'slug'],
    group: FIELD_LABELS.categories.adminGroup,
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: staffAccess,
    update: staffAccess,
    delete: adminAccess,
  },
  // Revalidation is handled by the content collections that use these categories.
  fields: [
    {
      name: 'title',
      type: 'text',
      label: FIELD_LABELS.categories.title,
      required: true,
    },
    slugField,
    {
      name: 'description',
      type: 'textarea',
      label: FIELD_LABELS.categories.description,
    },
  ],
}

export default Categories
