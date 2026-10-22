import type { Access, CollectionBeforeValidateHook, CollectionConfig, TypeWithID } from 'payload'
import { ValidationError } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

type SubmissionDocument = TypeWithID & {
  email?: string | null
  message?: string | null
  phone?: string | null
  website?: string | null
}

function isStaff(user: unknown): boolean {
  return (
    typeof user === 'object' &&
    user !== null &&
    'role' in user &&
    (user.role === 'admin' || user.role === 'editor')
  )
}

function isAdmin(user: unknown): boolean {
  return typeof user === 'object' && user !== null && 'role' in user && user.role === 'admin'
}

const staffRead: Access = ({ req }) => isStaff(req.user)
const staffUpdate: Access = ({ req }) => isStaff(req.user)
const adminWrite: Access = ({ req }) => isAdmin(req.user)

function isValidVietnamesePhone(value: string): boolean {
  const normalized = value.replace(/[\s()-]/g, '')
  return /^(?:\+?84|0)\d{9,10}$/.test(normalized)
}

const validateSubmission: CollectionBeforeValidateHook<SubmissionDocument> = ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data) return data
  const errors: { path: string; message: string }[] = []

  if (typeof data.website === 'string' && data.website.trim()) {
    errors.push({ path: 'website', message: FIELD_LABELS.submissions.spamDetected })
  }

  if (data.message && data.message.length > 2000) {
    errors.push({ path: 'message', message: FIELD_LABELS.submissions.messageTooLong })
  }

  if (data.phone && !isValidVietnamesePhone(data.phone.trim())) {
    errors.push({ path: 'phone', message: FIELD_LABELS.submissions.invalidPhone })
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ path: 'email', message: FIELD_LABELS.submissions.invalidEmail })
  }

  if (errors.length) {
    throw new ValidationError({ collection: 'submissions', errors, req })
  }

  // TODO: Add an external rate limiter (for example Upstash) before accepting public submissions.
  return data
}

const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    defaultColumns: ['fullName', 'phone', 'email', 'processStatus', 'createdAt'],
    group: FIELD_LABELS.submissions.adminGroup,
    useAsTitle: 'fullName',
  },
  access: {
    read: staffRead,
    create: () => true,
    update: staffUpdate,
    delete: adminWrite,
  },
  hooks: {
    beforeValidate: [validateSubmission],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      label: FIELD_LABELS.submissions.fullName,
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: FIELD_LABELS.submissions.phone,
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: FIELD_LABELS.submissions.email,
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      label: FIELD_LABELS.submissions.message,
    },
    {
      name: 'interestedCourse',
      type: 'relationship',
      relationTo: 'courses',
      label: FIELD_LABELS.submissions.interestedCourse,
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      label: FIELD_LABELS.submissions.branch,
    },
    {
      name: 'processStatus',
      type: 'select',
      label: FIELD_LABELS.submissions.processStatus,
      defaultValue: 'moi',
      options: [
        { label: FIELD_LABELS.submissions.new, value: 'moi' },
        { label: FIELD_LABELS.submissions.contacted, value: 'da-lien-he' },
        { label: FIELD_LABELS.submissions.consulted, value: 'da-tu-van' },
        { label: FIELD_LABELS.submissions.closed, value: 'dong' },
      ],
    },
    {
      name: 'website',
      type: 'text',
      label: FIELD_LABELS.submissions.website,
      admin: { hidden: true },
    },
  ],
}

export default Submissions
