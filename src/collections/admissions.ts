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
type AdmissionDocument = TypeWithID & {
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
const readAdmissions: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }
const deleteAdmissions: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setAdmissionCreator: CollectionBeforeChangeHook<AdmissionDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedAdmission: CollectionAfterChangeHook<AdmissionDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('admissions', doc.slug, previousDoc.slug, [
    '/tuyen-sinh',
    '/tuyen-sinh/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const revalidateDeletedAdmission: CollectionAfterDeleteHook<AdmissionDocument> = ({ doc }) => {
  revalidateCollection('admissions', doc.slug, null, [
    '/tuyen-sinh',
    '/tuyen-sinh/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const Admissions: CollectionConfig = {
  slug: 'admissions',
  admin: {
    defaultColumns: ['title', 'deadline', 'admissionStatus', 'status'],
    group: FIELD_LABELS.admissions.adminGroup,
    preview: (doc) => {
      if (typeof doc.slug !== 'string' || !doc.slug) return null
      const params = new URLSearchParams({
        collection: 'admissions',
        slug: doc.slug,
        secret: process.env.PREVIEW_SECRET ?? '',
      })
      return `/api/preview?${params.toString()}`
    },
    useAsTitle: 'title',
  },
  access: {
    read: readAdmissions,
    create: staffAccess,
    update: staffAccess,
    delete: deleteAdmissions,
  },
  hooks: {
    beforeChange: [setAdmissionCreator],
    afterChange: [revalidateChangedAdmission],
    afterDelete: [revalidateDeletedAdmission],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.admissions.contentTab,
          fields: [
            { name: 'title', type: 'text', label: FIELD_LABELS.admissions.title, required: true },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.admissions.featuredImage,
            },
            { name: 'content', type: 'richText', label: FIELD_LABELS.admissions.content },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.admissions.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        {
          label: FIELD_LABELS.admissions.statusTab,
          fields: [
            {
              name: 'deadline',
              type: 'date',
              label: FIELD_LABELS.admissions.deadline,
              required: true,
            },
            {
              name: 'admissionStatus',
              type: 'select',
              label: FIELD_LABELS.admissions.admissionStatus,
              required: true,
              defaultValue: 'dang-mo',
              options: [
                { label: FIELD_LABELS.admissions.open, value: 'dang-mo' },
                { label: FIELD_LABELS.admissions.closed, value: 'da-dong' },
              ],
            },
          ],
        },
        {
          label: FIELD_LABELS.admissions.linksTab,
          fields: [
            {
              name: 'relatedCourses',
              type: 'relationship',
              relationTo: 'courses',
              hasMany: true,
              label: FIELD_LABELS.admissions.relatedCourses,
            },
            {
              name: 'attachments',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              label: FIELD_LABELS.admissions.attachments,
            },
          ],
        },
        { label: FIELD_LABELS.admissions.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Admissions
