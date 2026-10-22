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
type AchievementDocument = TypeWithID & {
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
const readAchievements: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }
const deleteAchievements: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setAchievementCreator: CollectionBeforeChangeHook<AchievementDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedAchievement: CollectionAfterChangeHook<AchievementDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('achievements', doc.slug, previousDoc.slug, [
    '/thanh-tich',
    '/thanh-tich/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const revalidateDeletedAchievement: CollectionAfterDeleteHook<AchievementDocument> = ({ doc }) => {
  revalidateCollection('achievements', doc.slug, null, [
    '/thanh-tich',
    '/thanh-tich/[slug]',
    '/',
    '/sitemap.xml',
  ])
  return doc
}

const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    defaultColumns: [
      'studentName',
      'award',
      'examName',
      'year',
      'awardLevel',
      'status',
    ],
    group: FIELD_LABELS.achievements.adminGroup,
    useAsTitle: 'studentName',
  },
  access: {
    read: readAchievements,
    create: staffAccess,
    update: staffAccess,
    delete: deleteAchievements,
  },
  hooks: {
    beforeChange: [setAchievementCreator],
    afterChange: [revalidateChangedAchievement],
    afterDelete: [revalidateDeletedAchievement],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.achievements.studentTab,
          fields: [
            {
              name: 'title',
              type: 'text',
              label: FIELD_LABELS.posts.title,
              required: true,
            },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.achievements.featuredImage,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: FIELD_LABELS.achievements.categories,
              // TODO: Use this relationship when the frontend adds category filtering.
            },
            {
              name: 'studentName',
              type: 'text',
              label: FIELD_LABELS.achievements.studentName,
              required: true,
            },
            { name: 'school', type: 'text', label: FIELD_LABELS.achievements.school },
            { name: 'className', type: 'text', label: FIELD_LABELS.achievements.className },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.achievements.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        {
          label: FIELD_LABELS.achievements.awardTab,
          fields: [
            {
              name: 'award',
              type: 'text',
              label: FIELD_LABELS.achievements.award,
              required: true,
            },
            {
              name: 'examName',
              type: 'text',
              label: FIELD_LABELS.achievements.examName,
              required: true,
            },
            {
              name: 'year',
              type: 'number',
              label: FIELD_LABELS.achievements.year,
              required: true,
              min: 1000,
              max: 9999,
              validate: (value: number | null | undefined) =>
                value == null ||
                Number.isInteger(value) ||
                FIELD_LABELS.achievements.invalidYear,
            },
            {
              name: 'awardLevel',
              type: 'select',
              label: FIELD_LABELS.achievements.awardLevel,
              required: true,
              options: [
                { label: FIELD_LABELS.achievements.first, value: 'nhat' },
                { label: FIELD_LABELS.achievements.second, value: 'nhi' },
                { label: FIELD_LABELS.achievements.third, value: 'ba' },
                { label: FIELD_LABELS.achievements.consolation, value: 'khuyen-khich' },
                { label: FIELD_LABELS.achievements.other, value: 'giai-khac' },
              ],
            },
            {
              name: 'note',
              type: 'textarea',
              label: FIELD_LABELS.achievements.note,
            },
          ],
        },
        { label: FIELD_LABELS.achievements.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Achievements
