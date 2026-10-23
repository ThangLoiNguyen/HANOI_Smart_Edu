import type {
  Access,
  Block,
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
type PageDocument = TypeWithID & {
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
const readPages: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }
const deletePages: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setPageCreator: CollectionBeforeChangeHook<PageDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedPage: CollectionAfterChangeHook<PageDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('pages', doc.slug, previousDoc.slug, ['/[slug]', '/sitemap.xml'])
  return doc
}

const revalidateDeletedPage: CollectionAfterDeleteHook<PageDocument> = ({ doc }) => {
  revalidateCollection('pages', doc.slug, null, ['/[slug]', '/sitemap.xml'])
  return doc
}

const textBlock: Block = {
  slug: 'textBlock',
  interfaceName: 'TextBlock',
  labels: { singular: FIELD_LABELS.pages.textBlock, plural: FIELD_LABELS.pages.textBlock },
  fields: [
    { name: 'heading', type: 'text', label: FIELD_LABELS.pages.heading },
    { name: 'body', type: 'richText', label: FIELD_LABELS.pages.body },
  ],
}

const imageBlock: Block = {
  slug: 'imageBlock',
  interfaceName: 'ImageBlock',
  labels: { singular: FIELD_LABELS.pages.imageBlock, plural: FIELD_LABELS.pages.imageBlock },
  fields: [
    { name: 'image', type: 'relationship', relationTo: 'media', label: FIELD_LABELS.pages.image },
    { name: 'caption', type: 'text', label: FIELD_LABELS.pages.caption },
  ],
}

const statsBlock: Block = {
  slug: 'statsBlock',
  interfaceName: 'StatsBlock',
  labels: { singular: FIELD_LABELS.pages.statsBlock, plural: FIELD_LABELS.pages.statsBlock },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: FIELD_LABELS.pages.items,
      fields: [
        { name: 'label', type: 'text', label: FIELD_LABELS.pages.label, required: true },
        { name: 'value', type: 'text', label: FIELD_LABELS.pages.value, required: true },
      ],
    },
  ],
}

const teamBlock: Block = {
  slug: 'teamBlock',
  interfaceName: 'TeamBlock',
  labels: { singular: FIELD_LABELS.pages.teamBlock, plural: FIELD_LABELS.pages.teamBlock },
  fields: [
    {
      name: 'members',
      type: 'array',
      label: FIELD_LABELS.pages.members,
      fields: [
        { name: 'name', type: 'text', label: FIELD_LABELS.pages.name, required: true },
        { name: 'role', type: 'text', label: FIELD_LABELS.pages.role },
        { name: 'photo', type: 'relationship', relationTo: 'media', label: FIELD_LABELS.pages.photo },
        { name: 'bio', type: 'textarea', label: FIELD_LABELS.pages.bio },
      ],
    },
  ],
}

const ctaBlock: Block = {
  slug: 'ctaBlock',
  interfaceName: 'CtaBlock',
  labels: { singular: FIELD_LABELS.pages.ctaBlock, plural: FIELD_LABELS.pages.ctaBlock },
  fields: [
    { name: 'heading', type: 'text', label: FIELD_LABELS.pages.heading },
    { name: 'description', type: 'textarea', label: FIELD_LABELS.pages.description },
    { name: 'buttonLabel', type: 'text', label: FIELD_LABELS.pages.buttonLabel },
    { name: 'buttonLink', type: 'text', label: FIELD_LABELS.pages.buttonLink },
  ],
}

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: FIELD_LABELS.pages.adminGroup,
    preview: (doc) => {
      if (typeof doc.slug !== 'string' || !doc.slug) return null
      const params = new URLSearchParams({
        collection: 'pages',
        slug: doc.slug,
        secret: process.env.PREVIEW_SECRET ?? '',
      })
      return `/api/preview?${params.toString()}`
    },
    useAsTitle: 'title',
  },
  access: {
    read: readPages,
    create: staffAccess,
    update: staffAccess,
    delete: deletePages,
  },
  hooks: {
    beforeChange: [setPageCreator],
    afterChange: [revalidateChangedPage],
    afterDelete: [revalidateDeletedPage],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.pages.layoutTab,
          fields: [
            { name: 'title', type: 'text', label: FIELD_LABELS.pages.title, required: true },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.pages.featuredImage,
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [textBlock, imageBlock, statsBlock, teamBlock, ctaBlock],
            },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.pages.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        { label: FIELD_LABELS.pages.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Pages
