import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  TypeWithID,
} from 'payload'
import { ValidationError } from 'payload'

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

type StaffRole = 'admin' | 'editor'

type StaffUser = {
  id: number | string
  role: StaffRole
}

type DocumentRecord = TypeWithID & {
  createdBy?: number | string | { id: number | string } | null
  externalLink?: string | null
  file?: unknown
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

const readDocuments: Access = ({ req }) => {
  if (isStaffUser(req.user)) {
    return true
  }

  return {
    status: {
      equals: 'published',
    },
  }
}

const staffAccess: Access = ({ req }) => isStaffUser(req.user)

const deleteDocuments: Access = ({ req }) => {
  if (!isStaffUser(req.user)) {
    return false
  }

  if (req.user.role === 'admin') {
    return true
  }

  return {
    createdBy: {
      equals: req.user.id,
    },
  }
}

const setDocumentCreator: CollectionBeforeChangeHook<DocumentRecord> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) {
    data.createdBy = req.user.id
  } else if (operation === 'update' && originalDoc) {
    data.createdBy = originalDoc.createdBy
  }

  return data
}

const validateDocumentFile: CollectionBeforeValidateHook<DocumentRecord> = ({
  data,
  originalDoc,
  req,
}) => {
  const file = data?.file !== undefined ? data.file : originalDoc?.file
  const externalLink =
    data?.externalLink !== undefined ? data.externalLink : originalDoc?.externalLink

  if (file == null && !externalLink?.trim()) {
    throw new ValidationError({
      collection: 'documents',
      errors: [
        {
          path: 'file',
          message: FIELD_LABELS.documents.fileOrExternalLinkRequired,
        },
      ],
      req,
    })
  }

  return data
}

const revalidateChangedDocument: CollectionAfterChangeHook<DocumentRecord> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('documents', doc.slug, previousDoc.slug, ['/tai-lieu', '/sitemap.xml'])
  return doc
}

const revalidateDeletedDocument: CollectionAfterDeleteHook<DocumentRecord> = ({ doc }) => {
  revalidateCollection('documents', doc.slug, null, ['/tai-lieu', '/sitemap.xml'])
  return doc
}

const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    defaultColumns: ['title', 'level', 'grade', 'category', 'type', 'status'],
    group: FIELD_LABELS.documents.adminGroup,
    useAsTitle: 'title',
  },
  access: {
    read: readDocuments,
    create: staffAccess,
    update: staffAccess,
    delete: deleteDocuments,
  },
  hooks: {
    beforeValidate: [validateDocumentFile],
    beforeChange: [setDocumentCreator],
    afterChange: [revalidateChangedDocument],
    afterDelete: [revalidateDeletedDocument],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.documents.contentTab,
          fields: [
            {
              name: 'title',
              type: 'text',
              label: FIELD_LABELS.documents.title,
              required: true,
            },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'type',
              type: 'select',
              label: FIELD_LABELS.documents.type,
              required: true,
              options: [
                { label: FIELD_LABELS.documents.document, value: 'tai-lieu' },
                { label: FIELD_LABELS.documents.exam, value: 'de-thi' },
                { label: FIELD_LABELS.documents.answer, value: 'dap-an' },
              ],
            },
            {
              name: 'level',
              type: 'select',
              label: FIELD_LABELS.documents.level,
              required: true,
              options: DOCUMENT_LEVELS.map(({ label, value }) => ({ label, value })),
            },
            {
              name: 'grade',
              type: 'select',
              label: FIELD_LABELS.documents.grade,
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
                  FIELD_LABELS.documents.invalidGrade
                )
              },
            },
            {
              name: 'category',
              type: 'select',
              label: FIELD_LABELS.documents.category,
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
                  FIELD_LABELS.documents.invalidCategory
                )
              },
            },
            {
              name: 'subject',
              type: 'select',
              label: FIELD_LABELS.documents.subject,
              required: true,
              // TODO: Replace placeholders after the subject list is decided in 07-open-questions.md.
              options: [
                { label: FIELD_LABELS.documents.math, value: 'toan' },
                { label: FIELD_LABELS.documents.literature, value: 'ngu-van' },
                { label: FIELD_LABELS.documents.english, value: 'tieng-anh' },
              ],
            },
            {
              name: 'year',
              type: 'number',
              label: FIELD_LABELS.documents.year,
              required: true,
              min: 1000,
              max: 9999,
              validate: (value: number | null | undefined) => {
                if (value == null) {
                  return true
                }

                return Number.isInteger(value) || FIELD_LABELS.documents.invalidYear
              },
            },
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.documents.featuredImage,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: FIELD_LABELS.documents.categories,
              // TODO: Use this relationship when the frontend adds category filtering.
            },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.documents.createdBy,
              admin: {
                hidden: true,
                readOnly: true,
              },
              access: {
                update: () => false,
              },
            },
          ],
        },
        {
          label: FIELD_LABELS.documents.fileLinkTab,
          fields: [
            {
              name: 'file',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.documents.file,
            },
            {
              name: 'externalLink',
              type: 'text',
              label: FIELD_LABELS.documents.externalLink,
              validate: (value: string | null | undefined) => {
                if (typeof value !== 'string' || value.trim() === '') {
                  return true
                }

                try {
                  const url = new URL(value)
                  return (
                    url.protocol === 'http:' ||
                    url.protocol === 'https:' ||
                    FIELD_LABELS.documents.invalidExternalLink
                  )
                } catch {
                  return FIELD_LABELS.documents.invalidExternalLink
                }
              },
            },
          ],
        },
        {
          label: FIELD_LABELS.documents.seoTab,
          fields: [seoField],
        },
      ],
    },
  ],
}

export default Documents
