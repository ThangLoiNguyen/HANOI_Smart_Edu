import type { Field, GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { revalidateCollection } from '@/lib/revalidate'

function isAdmin(user: unknown): boolean {
  return typeof user === 'object' && user !== null && 'role' in user && user.role === 'admin'
}

const revalidateNavigation: GlobalAfterChangeHook = ({ doc }) => {
  revalidateCollection('navigation', null, null, ['/'])
  return doc
}

function menuFields(includeChildren: boolean) {
  const fields: Field[] = [
    { name: 'label', type: 'text' as const, label: FIELD_LABELS.globals.label, required: true },
    {
      name: 'type',
      type: 'select' as const,
      label: FIELD_LABELS.globals.type,
      required: true,
      options: [
        { label: FIELD_LABELS.globals.page, value: 'page' },
        { label: FIELD_LABELS.globals.collection, value: 'collection' },
        { label: FIELD_LABELS.globals.external, value: 'external' },
      ],
    },
    {
      name: 'page',
      type: 'relationship' as const,
      relationTo: 'pages' as const,
      label: FIELD_LABELS.globals.page,
      admin: { condition: (_: unknown, siblingData: { type?: string }) => siblingData.type === 'page' },
    },
    {
      name: 'collection',
      type: 'select' as const,
      label: FIELD_LABELS.globals.collection,
      options: [
        { label: FIELD_LABELS.posts.adminGroup, value: 'posts' },
        { label: FIELD_LABELS.courses.adminGroup, value: 'courses' },
        { label: FIELD_LABELS.admissions.adminGroup, value: 'admissions' },
        { label: FIELD_LABELS.achievements.adminGroup, value: 'achievements' },
        { label: FIELD_LABELS.documents.adminGroup, value: 'documents' },
        { label: FIELD_LABELS.exams.adminGroup, value: 'exams' },
        { label: FIELD_LABELS.albums.adminGroup, value: 'albums' },
        { label: FIELD_LABELS.branches.adminGroup, value: 'branches' },
      ],
      admin: {
        condition: (_: unknown, siblingData: { type?: string }) => siblingData.type === 'collection',
      },
    },
    {
      name: 'url',
      type: 'text' as const,
      label: FIELD_LABELS.globals.url,
      admin: {
        condition: (_: unknown, siblingData: { type?: string }) => siblingData.type === 'external',
      },
    },
  ]

  if (includeChildren) {
    fields.push({
      name: 'children',
      type: 'array',
      label: FIELD_LABELS.globals.children,
      fields: menuFields(false),
    })
  }

  return fields
}

const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: FIELD_LABELS.globals.navigation,
  access: {
    read: () => true,
    update: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [revalidateNavigation],
  },
  fields: [
    {
      name: 'mainMenu',
      type: 'array',
      label: FIELD_LABELS.globals.mainMenu,
      fields: menuFields(true),
    },
    {
      name: 'footerMenu',
      type: 'array',
      label: FIELD_LABELS.globals.footerMenu,
      fields: menuFields(false),
    },
  ],
}

export default Navigation
