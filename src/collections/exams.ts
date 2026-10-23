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
type ExamDocument = TypeWithID & {
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
const readExams: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }
const deleteExams: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setExamCreator: CollectionBeforeChangeHook<ExamDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedExam: CollectionAfterChangeHook<ExamDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('exams', doc.slug, previousDoc.slug, [
    '/ky-thi',
    '/ky-thi/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const revalidateDeletedExam: CollectionAfterDeleteHook<ExamDocument> = ({ doc }) => {
  revalidateCollection('exams', doc.slug, null, [
    '/ky-thi',
    '/ky-thi/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const Exams: CollectionConfig = {
  slug: 'exams',
  admin: {
    defaultColumns: ['title', 'year', 'examStatus', 'status'],
    group: FIELD_LABELS.exams.adminGroup,
    preview: (doc) => {
      if (typeof doc.slug !== 'string' || !doc.slug) return null
      const params = new URLSearchParams({
        collection: 'exams',
        slug: doc.slug,
        secret: process.env.PREVIEW_SECRET ?? '',
      })
      return `/api/preview?${params.toString()}`
    },
    useAsTitle: 'title',
  },
  access: {
    read: readExams,
    create: staffAccess,
    update: staffAccess,
    delete: deleteExams,
  },
  hooks: {
    beforeChange: [setExamCreator],
    afterChange: [revalidateChangedExam],
    afterDelete: [revalidateDeletedExam],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.exams.infoTab,
          fields: [
            { name: 'title', type: 'text', label: FIELD_LABELS.exams.title, required: true },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.exams.featuredImage,
            },
            {
              name: 'year',
              type: 'number',
              label: FIELD_LABELS.exams.year,
              required: true,
              min: 1000,
              max: 9999,
              validate: (value: number | null | undefined) =>
                value == null || Number.isInteger(value) || FIELD_LABELS.exams.invalidYear,
            },
            { name: 'audience', type: 'text', label: FIELD_LABELS.exams.audience },
            { name: 'rules', type: 'richText', label: FIELD_LABELS.exams.rules },
            {
              name: 'examStatus',
              type: 'select',
              label: FIELD_LABELS.exams.examStatus,
              required: true,
              defaultValue: 'sap-dien-ra',
              options: [
                { label: FIELD_LABELS.exams.upcoming, value: 'sap-dien-ra' },
                { label: FIELD_LABELS.exams.inProgress, value: 'dang-dien-ra' },
                { label: FIELD_LABELS.exams.completed, value: 'da-ket-thuc' },
              ],
            },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.exams.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        {
          label: FIELD_LABELS.exams.scheduleTab,
          fields: [
            {
              name: 'schedule',
              type: 'array',
              label: FIELD_LABELS.exams.schedule,
              // Separate entries keep each date, time, and location independently filterable.
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: FIELD_LABELS.exams.scheduleLabel,
                  required: true,
                },
                {
                  name: 'datetime',
                  type: 'date',
                  label: FIELD_LABELS.exams.datetime,
                  required: true,
                },
                { name: 'location', type: 'text', label: FIELD_LABELS.exams.location },
              ],
            },
            { name: 'location', type: 'text', label: FIELD_LABELS.exams.location },
          ],
        },
        {
          label: FIELD_LABELS.exams.resultsTab,
          fields: [
            {
              name: 'results',
              type: 'group',
              label: FIELD_LABELS.exams.results,
              fields: [
                {
                  name: 'file',
                  type: 'relationship',
                  relationTo: 'media',
                  label: FIELD_LABELS.exams.resultsFile,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: FIELD_LABELS.exams.resultsDescription,
                },
              ],
            },
            {
              name: 'relatedDocuments',
              type: 'relationship',
              relationTo: 'documents',
              hasMany: true,
              label: FIELD_LABELS.exams.relatedDocuments,
            },
          ],
        },
        { label: FIELD_LABELS.exams.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Exams
