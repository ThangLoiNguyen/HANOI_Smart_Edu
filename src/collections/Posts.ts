import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  TypeWithID,
} from 'payload'

import { publishedAtField } from '@/lib/fields/published-at-field'
import { FIELD_LABELS } from '@/lib/fields/labels'
import { seoField } from '@/lib/fields/seo-field'
import { slugField } from '@/lib/fields/slug-field'
import { statusField } from '@/lib/fields/status-field'
import { revalidatePost } from '@/lib/revalidate'

type StaffRole = 'admin' | 'editor'

type StaffUser = {
  id: number | string
  role: StaffRole
}

type PostDocument = TypeWithID & {
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

const readPosts: Access = ({ req }) => {
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

const deletePosts: Access = ({ req }) => {
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

const setPostCreator: CollectionBeforeChangeHook<PostDocument> = ({
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

const revalidateChangedPost: CollectionAfterChangeHook<PostDocument> = ({ doc, previousDoc }) => {
  revalidatePost(doc.slug, previousDoc.slug)
  return doc
}

const revalidateDeletedPost: CollectionAfterDeleteHook<PostDocument> = ({ doc }) => {
  revalidatePost(doc.slug)
  return doc
}

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: FIELD_LABELS.posts.adminGroup,
    useAsTitle: 'title',
  },
  access: {
    read: readPosts,
    create: staffAccess,
    update: staffAccess,
    delete: deletePosts,
  },
  hooks: {
    beforeChange: [setPostCreator],
    afterChange: [revalidateChangedPost],
    afterDelete: [revalidateDeletedPost],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: FIELD_LABELS.posts.contentTab,
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
              name: 'content',
              type: 'richText',
              label: FIELD_LABELS.posts.content,
            },
            {
              name: 'excerpt',
              type: 'text',
              label: FIELD_LABELS.posts.excerpt,
            },
            {
              name: 'type',
              type: 'select',
              label: FIELD_LABELS.posts.type,
              required: true,
              options: [
                { label: FIELD_LABELS.posts.news, value: 'tin-tuc' },
                { label: FIELD_LABELS.posts.event, value: 'su-kien' },
                { label: FIELD_LABELS.posts.press, value: 'bao-chi' },
              ],
            },
            {
              name: 'source',
              type: 'text',
              label: FIELD_LABELS.posts.source,
              admin: {
                condition: (_, siblingData) => siblingData.type === 'bao-chi',
              },
            },
            {
              name: 'sourceUrl',
              type: 'text',
              label: FIELD_LABELS.posts.sourceUrl,
              admin: {
                condition: (_, siblingData) => siblingData.type === 'bao-chi',
              },
            },
            {
              name: 'featured',
              type: 'checkbox',
              label: FIELD_LABELS.posts.featured,
              defaultValue: false,
            },
            {
              name: 'featuredImage',
              type: 'relationship',
              relationTo: 'media',
              label: FIELD_LABELS.posts.featuredImage,
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: FIELD_LABELS.posts.categories,
              // TODO: Use this relationship when the frontend adds category filtering.
            },
            {
              name: 'createdBy',
              type: 'relationship',
              relationTo: 'users',
              label: FIELD_LABELS.posts.createdBy,
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
          label: FIELD_LABELS.posts.seoTab,
          fields: [seoField],
        },
      ],
    },
  ],
}

export default Posts
