import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  TypeWithID,
} from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { publishedAtField } from '@/lib/fields/published-at-field'
import { seoField } from '@/lib/fields/seo-field'
import { slugField } from '@/lib/fields/slug-field'
import { statusField } from '@/lib/fields/status-field'
import { revalidateCollection } from '@/lib/revalidate'

type StaffUser = { id: number | string; role: 'admin' | 'editor' }
type BranchDocument = TypeWithID & {
  createdBy?: number | string | { id: number | string } | null
  slug?: string | null
}

function isStaffUser(user: unknown): user is StaffUser {
  if (typeof user !== 'object' || user === null || !('role' in user) || !('id' in user)) return false
  return (
    (user.role === 'admin' || user.role === 'editor') &&
    (typeof user.id === 'number' || typeof user.id === 'string')
  )
}

const staffAccess: Access = ({ req }) => isStaffUser(req.user)
const readBranches: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }
const deleteBranches: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setBranchCreator: CollectionBeforeChangeHook<BranchDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedBranch: CollectionAfterChangeHook<BranchDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('branches', doc.slug, previousDoc.slug, [
    '/co-so',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const revalidateDeletedBranch: CollectionAfterDeleteHook<BranchDocument> = ({ doc }) => {
  revalidateCollection('branches', doc.slug, null, ['/co-so', '/', '/sitemap.xml'])
  return doc
}

const validatePhone = (value: string | null | undefined) => {
  if (!value?.trim()) return true
  return (
    /^(\+?84|0)[\s.-]?\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4}$/.test(value.trim()) ||
    FIELD_LABELS.branches.invalidPhone
  )
}

const validateUrl = (value: string | null | undefined) => {
  if (!value?.trim()) return true
  try {
    const url = new URL(value)
    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      FIELD_LABELS.branches.invalidUrl
    )
  } catch {
    return FIELD_LABELS.branches.invalidUrl
  }
}

const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    defaultColumns: ['title', 'address', 'phone', 'order', 'status'],
    group: FIELD_LABELS.branches.adminGroup,
    useAsTitle: 'title',
  },
  access: {
    read: readBranches,
    create: staffAccess,
    update: staffAccess,
    delete: deleteBranches,
  },
  hooks: {
    beforeChange: [setBranchCreator],
    afterChange: [revalidateChangedBranch],
    afterDelete: [revalidateDeletedBranch],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.branches.infoTab,
          fields: [
            { name: 'title', type: 'text', label: FIELD_LABELS.branches.title, required: true },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.branches.featuredImage,
            },
            {
              name: 'order',
              type: 'number',
              label: FIELD_LABELS.branches.order,
              defaultValue: 0,
              min: 0,
            },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.branches.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        {
          label: FIELD_LABELS.branches.locationTab,
          fields: [
            {
              name: 'address',
              type: 'textarea',
              label: FIELD_LABELS.branches.address,
              required: true,
            },
            {
              name: 'phone',
              type: 'text',
              label: FIELD_LABELS.branches.phone,
              validate: validatePhone,
            },
            {
              name: 'workingHours',
              type: 'text',
              label: FIELD_LABELS.branches.workingHours,
            },
            {
              name: 'googleMapsUrl',
              type: 'text',
              label: FIELD_LABELS.branches.googleMapsUrl,
              validate: validateUrl,
            },
          ],
        },
        { label: FIELD_LABELS.branches.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Branches
