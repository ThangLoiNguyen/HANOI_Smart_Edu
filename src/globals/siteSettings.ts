import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { revalidateCollection } from '@/lib/revalidate'

function isAdmin(user: unknown): boolean {
  return typeof user === 'object' && user !== null && 'role' in user && user.role === 'admin'
}

function validateOptionalUrl(value: string | null | undefined) {
  if (!value?.trim()) return true
  try {
    const url = new URL(value)
    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      FIELD_LABELS.globals.invalidUrl
    )
  } catch {
    return FIELD_LABELS.globals.invalidUrl
  }
}

const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc }) => {
  revalidateCollection('siteSettings', null, null, ['/', '/sitemap.xml'])
  return doc
}

const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: FIELD_LABELS.globals.siteSettings,
  access: {
    read: () => true,
    update: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    { name: 'siteName', type: 'text', label: FIELD_LABELS.globals.siteName, required: true },
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
      label: FIELD_LABELS.globals.logo,
    },
    {
      name: 'favicon',
      type: 'relationship',
      relationTo: 'media',
      label: FIELD_LABELS.globals.favicon,
    },
    { name: 'hotline', type: 'text', label: FIELD_LABELS.globals.hotline },
    { name: 'email', type: 'email', label: FIELD_LABELS.globals.email },
    {
      name: 'zaloUrl',
      type: 'text',
      label: FIELD_LABELS.globals.zaloUrl,
      validate: validateOptionalUrl,
    },
    {
      name: 'facebookUrl',
      type: 'text',
      label: FIELD_LABELS.globals.facebookUrl,
      validate: validateOptionalUrl,
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      label: FIELD_LABELS.globals.youtubeUrl,
      validate: validateOptionalUrl,
    },
    { name: 'workingHours', type: 'text', label: FIELD_LABELS.globals.workingHours },
    {
      name: 'googleAnalyticsId',
      type: 'text',
      label: FIELD_LABELS.globals.googleAnalyticsId,
    },
    {
      name: 'defaultSeo',
      type: 'group',
      label: FIELD_LABELS.globals.defaultSeo,
      fields: [
        { name: 'metaTitle', type: 'text', label: FIELD_LABELS.seo.metaTitle },
        { name: 'metaDescription', type: 'textarea', label: FIELD_LABELS.seo.metaDescription },
        {
          name: 'shareImage',
          type: 'relationship',
          relationTo: 'media',
          label: FIELD_LABELS.seo.shareImage,
        },
      ],
    },
    {
      name: 'bankInfo',
      type: 'group',
      label: FIELD_LABELS.globals.bankInfo,
      fields: [
        { name: 'bankId', type: 'text', label: FIELD_LABELS.globals.bankId, required: true },
        { name: 'accountNo', type: 'text', label: FIELD_LABELS.globals.accountNo, required: true },
        {
          name: 'accountName',
          type: 'text',
          label: FIELD_LABELS.globals.accountName,
          required: true,
        },
      ],
    },
    {
      name: 'footerContent',
      type: 'richText',
      label: FIELD_LABELS.globals.footerContent,
    },
    {
      name: 'notificationPopup',
      type: 'group',
      label: FIELD_LABELS.globals.notificationPopup,
      fields: [
        { name: 'enabled', type: 'checkbox', label: FIELD_LABELS.globals.enabled },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          label: FIELD_LABELS.globals.image,
        },
        { name: 'link', type: 'text', label: FIELD_LABELS.globals.link },
        { name: 'expiresAt', type: 'date', label: FIELD_LABELS.globals.expiresAt },
      ],
    },
  ],
}

export default SiteSettings
