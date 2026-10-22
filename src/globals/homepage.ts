import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { revalidateCollection } from '@/lib/revalidate'

function isStaff(user: unknown): boolean {
  return (
    typeof user === 'object' &&
    user !== null &&
    'role' in user &&
    (user.role === 'admin' || user.role === 'editor')
  )
}

const revalidateHomepage: GlobalAfterChangeHook = ({ doc }) => {
  revalidateCollection('homepage', null, null, ['/'])
  return doc
}

const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: FIELD_LABELS.globals.homepage,
  access: {
    read: () => true,
    update: ({ req }) => isStaff(req.user),
  },
  hooks: {
    afterChange: [revalidateHomepage],
  },
  fields: [
    {
      name: 'banners',
      type: 'array',
      label: FIELD_LABELS.globals.banner,
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          label: FIELD_LABELS.globals.image,
          required: true,
        },
        { name: 'title', type: 'text', label: FIELD_LABELS.globals.title },
        { name: 'link', type: 'text', label: FIELD_LABELS.globals.link },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: FIELD_LABELS.globals.stats,
      fields: [
        { name: 'label', type: 'text', label: FIELD_LABELS.globals.label },
        { name: 'value', type: 'text', label: FIELD_LABELS.globals.value },
      ],
    },
    {
      name: 'featuredCourses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      label: FIELD_LABELS.globals.featuredCourses,
    },
    {
      name: 'featuredPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      label: FIELD_LABELS.globals.featuredPosts,
    },
    {
      name: 'featuredAchievements',
      type: 'relationship',
      relationTo: 'achievements',
      hasMany: true,
      label: FIELD_LABELS.globals.featuredAchievements,
    },
    {
      name: 'ctaBlock',
      type: 'group',
      label: FIELD_LABELS.globals.ctaBlock,
      fields: [
        { name: 'heading', type: 'text', label: FIELD_LABELS.globals.heading },
        { name: 'description', type: 'textarea', label: FIELD_LABELS.globals.description },
        { name: 'buttonLabel', type: 'text', label: FIELD_LABELS.globals.buttonLabel },
        { name: 'buttonLink', type: 'text', label: FIELD_LABELS.globals.buttonLink },
      ],
    },
  ],
}

export default Homepage
