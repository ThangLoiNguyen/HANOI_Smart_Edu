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
type CourseDocument = TypeWithID & {
  createdBy?: number | string | { id: number | string } | null
  slug?: string | null
}

function isStaffUser(user: unknown): user is StaffUser {
  if (typeof user !== 'object' || user === null || !('role' in user) || !('id' in user)) {
    return false
  }
  return (
    (user.role === 'admin' || user.role === 'editor') &&
    (typeof user.id === 'number' || typeof user.id === 'string')
  )
}

const readCourses: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }

const staffAccess: Access = ({ req }) => isStaffUser(req.user)

const deleteCourses: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setCourseCreator: CollectionBeforeChangeHook<CourseDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedCourse: CollectionAfterChangeHook<CourseDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('courses', doc.slug, previousDoc.slug, [
    '/khoa-hoc',
    '/khoa-hoc/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const revalidateDeletedCourse: CollectionAfterDeleteHook<CourseDocument> = ({ doc }) => {
  revalidateCollection('courses', doc.slug, null, [
    '/khoa-hoc',
    '/khoa-hoc/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    defaultColumns: ['title', 'grade', 'subject', 'duration', 'status'],
    group: FIELD_LABELS.courses.adminGroup,
    preview: (doc) => {
      if (typeof doc.slug !== 'string' || !doc.slug) return null
      const params = new URLSearchParams({
        collection: 'courses',
        slug: doc.slug,
        secret: process.env.PREVIEW_SECRET ?? '',
      })
      return `/api/preview?${params.toString()}`
    },
    useAsTitle: 'title',
  },
  access: {
    read: readCourses,
    create: staffAccess,
    update: staffAccess,
    delete: deleteCourses,
  },
  hooks: {
    beforeChange: [setCourseCreator],
    afterChange: [revalidateChangedCourse],
    afterDelete: [revalidateDeletedCourse],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.courses.contentTab,
          fields: [
            { name: 'title', type: 'text', label: FIELD_LABELS.courses.title, required: true },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.courses.featuredImage,
            },
            {
              name: 'grade',
              type: 'select',
              label: FIELD_LABELS.courses.grade,
              required: true,
              // TODO: Keep in sync with documents after the grade list is decided.
              options: [
                { label: FIELD_LABELS.courses.grade10, value: 'lop-10' },
                { label: FIELD_LABELS.courses.grade11, value: 'lop-11' },
                { label: FIELD_LABELS.courses.grade12, value: 'lop-12' },
              ],
            },
            {
              name: 'subject',
              type: 'select',
              label: FIELD_LABELS.courses.subject,
              required: true,
              // TODO: Keep in sync with documents after the subject list is decided.
              options: [
                { label: FIELD_LABELS.courses.math, value: 'toan' },
                { label: FIELD_LABELS.courses.literature, value: 'ngu-van' },
                { label: FIELD_LABELS.courses.english, value: 'tieng-anh' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              label: FIELD_LABELS.courses.description,
            },
            { name: 'roadmap', type: 'richText', label: FIELD_LABELS.courses.roadmap },
            { name: 'content', type: 'richText', label: FIELD_LABELS.courses.content },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.courses.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        {
          label: FIELD_LABELS.courses.scheduleTab,
          fields: [
            { name: 'audience', type: 'text', label: FIELD_LABELS.courses.audience },
            { name: 'duration', type: 'text', label: FIELD_LABELS.courses.duration },
            { name: 'schedule', type: 'text', label: FIELD_LABELS.courses.schedule },
            {
              name: 'tuition',
              type: 'number',
              label: FIELD_LABELS.courses.tuition,
              required: false,
              // TODO: Confirm whether tuition should be publicly displayed.
            },
          ],
        },
        {
          label: FIELD_LABELS.courses.linksTab,
          fields: [
            {
              name: 'branches',
              type: 'relationship',
              relationTo: 'branches',
              hasMany: true,
              label: FIELD_LABELS.courses.branches,
              // TODO: Branches collection is added in P7 and registered in P13.
            },
            {
              name: 'documents',
              type: 'relationship',
              relationTo: 'documents',
              hasMany: true,
              label: FIELD_LABELS.courses.documents,
              // TODO: Documents exists but is registered centrally in P13.
            },
          ],
        },
        { label: FIELD_LABELS.courses.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Courses
