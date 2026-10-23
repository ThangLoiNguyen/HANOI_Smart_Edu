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
type AlbumDocument = TypeWithID & {
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
const readAlbums: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { status: { equals: 'published' } }
const deleteAlbums: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setAlbumCreator: CollectionBeforeChangeHook<AlbumDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedAlbum: CollectionAfterChangeHook<AlbumDocument> = ({
  doc,
  previousDoc,
}) => {
  revalidateCollection('albums', doc.slug, previousDoc.slug, [
    '/album',
    '/album/[slug]',
    '/sitemap.xml',
  ])
  return doc
}

const revalidateDeletedAlbum: CollectionAfterDeleteHook<AlbumDocument> = ({ doc }) => {
  revalidateCollection('albums', doc.slug, null, ['/album', '/album/[slug]', '/sitemap.xml'])
  return doc
}

const Albums: CollectionConfig = {
  slug: 'albums',
  admin: {
    defaultColumns: ['title', 'takenAt', 'status'],
    group: FIELD_LABELS.albums.adminGroup,
    preview: (doc) => {
      if (typeof doc.slug !== 'string' || !doc.slug) return null
      const params = new URLSearchParams({
        collection: 'albums',
        slug: doc.slug,
        secret: process.env.PREVIEW_SECRET ?? '',
      })
      return `/api/preview?${params.toString()}`
    },
    useAsTitle: 'title',
  },
  access: {
    read: readAlbums,
    create: staffAccess,
    update: staffAccess,
    delete: deleteAlbums,
  },
  hooks: {
    beforeChange: [setAlbumCreator],
    afterChange: [revalidateChangedAlbum],
    afterDelete: [revalidateDeletedAlbum],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.albums.albumTab,
          fields: [
            { name: 'title', type: 'text', label: FIELD_LABELS.albums.title, required: true },
            slugField,
            statusField,
            publishedAtField,
            {
              name: 'cover',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.albums.cover,
            },
            {
              name: 'photos',
              type: 'array',
              label: FIELD_LABELS.albums.photos,
              fields: [
                {
                  name: 'image',
                  type: 'relationship',
                  relationTo: 'media',
                  label: FIELD_LABELS.albums.image,
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  label: FIELD_LABELS.albums.caption,
                },
              ],
            },
            {
              name: 'takenAt',
              type: 'date',
              label: FIELD_LABELS.albums.takenAt,
            },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.albums.createdBy,
              admin: { hidden: true, readOnly: true },
              access: { update: () => false },
            },
          ],
        },
        {
          label: FIELD_LABELS.albums.eventTab,
          fields: [
            {
              name: 'relatedEvent',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              label: FIELD_LABELS.albums.relatedEvent,
              filterOptions: {
                type: {
                  equals: 'su-kien',
                },
              },
            },
          ],
        },
        { label: FIELD_LABELS.albums.seoTab, fields: [seoField] },
      ],
    },
  ],
}

export default Albums
