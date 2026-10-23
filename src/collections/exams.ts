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
import {
  DOCUMENT_CATEGORY_OPTIONS,
  DOCUMENT_GRADE_OPTIONS,
  DOCUMENT_LEVELS,
  getDocumentTaxonomySiblingData,
  getDocumentCategories,
  getDocumentGradeValues,
  isValidDocumentCategory,
  type DocumentCategory,
  type DocumentGrade,
} from '@/lib/document-taxonomy'
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
    defaultColumns: ['title', 'level', 'grade', 'category', 'isPremium', 'year', 'status'],
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
              name: 'level',
              type: 'select',
              label: FIELD_LABELS.exams.level,
              required: true,
              options: DOCUMENT_LEVELS.map(({ label, value }) => ({ label, value })),
            },
            {
              name: 'grade',
              type: 'select',
              label: FIELD_LABELS.exams.grade,
              required: true,
              options: DOCUMENT_GRADE_OPTIONS,
              filterOptions: ({ options, siblingData }) => {
                const validGrades = getDocumentGradeValues(siblingData.level)
                return options.filter((option) =>
                  validGrades.includes(
                    (typeof option === 'string' ? option : option.value) as DocumentGrade,
                  ),
                )
              },
              validate: (
                value: string | null | undefined,
                options: { siblingData: unknown },
              ) => {
                const { level } = getDocumentTaxonomySiblingData(options.siblingData)
                return (
                  value == null ||
                  getDocumentGradeValues(level).includes(value as DocumentGrade) ||
                  FIELD_LABELS.exams.invalidGrade
                )
              },
            },
            {
              name: 'category',
              type: 'select',
              label: FIELD_LABELS.exams.category,
              required: true,
              options: DOCUMENT_CATEGORY_OPTIONS,
              filterOptions: ({ options, siblingData }) => {
                if (!siblingData.level || !siblingData.grade) return []
                const validCategories = getDocumentCategories(siblingData.level, siblingData.grade)
                return options.filter((option) =>
                  validCategories.includes(
                    (typeof option === 'string' ? option : option.value) as DocumentCategory,
                  ),
                )
              },
              validate: (
                value: string | null | undefined,
                options: { siblingData: unknown },
              ) => {
                const { level, grade } = getDocumentTaxonomySiblingData(options.siblingData)
                return (
                  value == null ||
                  isValidDocumentCategory(level, grade, value) ||
                  FIELD_LABELS.exams.invalidCategory
                )
              },
            },
            {
              name: 'isPremium',
              type: 'checkbox',
              label: FIELD_LABELS.exams.isPremium,
              defaultValue: false,
            },
            {
              name: 'price',
              type: 'number',
              label: FIELD_LABELS.exams.price,
              min: 0,
              admin: {
                condition: (_data, siblingData) => {
                  const premiumValue =
                    typeof siblingData === 'object' && siblingData !== null && 'isPremium' in siblingData
                      ? siblingData.isPremium
                      : false
                  return Boolean(premiumValue)
                },
              },
              validate: (value: number | null | undefined, options: { siblingData: unknown }) => {
                const premiumValue =
                  typeof options.siblingData === 'object' &&
                  options.siblingData !== null &&
                  'isPremium' in options.siblingData
                    ? options.siblingData.isPremium
                    : false

                if (!premiumValue) return true
                return typeof value === 'number' && value >= 0
                  ? true
                  : FIELD_LABELS.exams.invalidPrice
              },
            },
            {
              name: 'durationMinutes',
              type: 'number',
              label: FIELD_LABELS.exams.durationMinutes,
              defaultValue: 45,
              min: 1,
              validate: (value: number | null | undefined) =>
                value == null || (Number.isInteger(value) && value > 0) || FIELD_LABELS.exams.invalidDuration,
            },
            {
              name: 'examContent',
              type: 'array',
              label: FIELD_LABELS.exams.examContent,
              access: {
                read: ({ req }) => isStaffUser(req.user),
              },
              fields: [
                {
                  name: 'question',
                  type: 'textarea',
                  label: FIELD_LABELS.exams.question,
                  required: true,
                },
                {
                  name: 'answers',
                  type: 'array',
                  label: FIELD_LABELS.exams.answers,
                  minRows: 4,
                  maxRows: 4,
                  required: true,
                  fields: [
                    {
                      name: 'answer',
                      type: 'text',
                      label: FIELD_LABELS.exams.answer,
                      required: true,
                    },
                  ],
                },
                {
                  name: 'correctIndex',
                  type: 'select',
                  label: FIELD_LABELS.exams.correctAnswer,
                  required: true,
                  options: [
                    { label: 'A', value: '0' },
                    { label: 'B', value: '1' },
                    { label: 'C', value: '2' },
                    { label: 'D', value: '3' },
                  ],
                },
              ],
            },
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
