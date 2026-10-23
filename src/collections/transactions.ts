import type { Access, CollectionBeforeValidateHook, CollectionConfig, TypeWithID } from 'payload'
import { ValidationError } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

type TransactionDocument = TypeWithID & {
  studentName?: string | null
  studentPhone?: string | null
  studentEmail?: string | null
  transferNote?: string | null
  exam?: number | { id: number } | null
  amount?: number | null
  status?: string | null
  paymentMethod?: string | null
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

function isValidVietnamesePhone(value: string): boolean {
  const normalized = value.replace(/[\s()-]/g, '')
  return /^(?:\+?84|0)\d{9,10}$/.test(normalized)
}

const staffRead: Access = ({ req }) => isStaff(req.user)
const staffUpdate: Access = ({ req }) => isStaff(req.user)
const adminWrite: Access = ({ req }) => isAdmin(req.user)

const validateTransaction: CollectionBeforeValidateHook<TransactionDocument> = ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data) return data

  const errors: { path: string; message: string }[] = []

  if (!data.studentName || data.studentName.trim().length < 2 || data.studentName.length > 100) {
    errors.push({ path: 'studentName', message: FIELD_LABELS.transactions.studentName })
  }

  if (!data.studentPhone || !isValidVietnamesePhone(data.studentPhone.trim())) {
    errors.push({ path: 'studentPhone', message: FIELD_LABELS.transactions.invalidPhone })
  }

  if (data.studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.studentEmail)) {
    errors.push({ path: 'studentEmail', message: FIELD_LABELS.transactions.invalidEmail })
  }

  if (typeof data.amount !== 'number' || Number.isNaN(data.amount) || data.amount <= 0) {
    errors.push({ path: 'amount', message: FIELD_LABELS.transactions.invalidAmount })
  }

  if (errors.length) {
    throw new ValidationError({ collection: 'transactions', errors, req })
  }

  return data
}

const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    defaultColumns: ['studentName', 'exam', 'amount', 'status', 'paymentMethod', 'createdAt'],
    group: FIELD_LABELS.transactions.adminGroup,
    useAsTitle: 'studentName',
  },
  access: {
    read: staffRead,
    create: () => true,
    update: staffUpdate,
    delete: adminWrite,
  },
  hooks: {
    beforeValidate: [validateTransaction],
  },
  fields: [
    {
      name: 'studentName',
      type: 'text',
      label: FIELD_LABELS.transactions.studentName,
      required: true,
    },
    {
      name: 'studentPhone',
      type: 'text',
      label: FIELD_LABELS.transactions.studentPhone,
      required: true,
    },
    {
      name: 'studentEmail',
      type: 'email',
      label: FIELD_LABELS.transactions.studentEmail,
    },
    {
      name: 'exam',
      type: 'relationship',
      relationTo: 'exams',
      label: FIELD_LABELS.transactions.exam,
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      label: FIELD_LABELS.transactions.amount,
      required: true,
      min: 1,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: FIELD_LABELS.transactions.paymentMethod,
      required: true,
      defaultValue: 'chuyen-khoan',
      options: [
        { label: 'Chuyển khoản', value: 'chuyen-khoan' },
        { label: 'VietQR', value: 'vietqr' },
        { label: 'Khác', value: 'khac' },
      ],
    },
    {
      name: 'transferNote',
      type: 'textarea',
      label: FIELD_LABELS.transactions.transferNote,
    },
    {
      name: 'paymentProof',
      type: 'relationship',
      relationTo: 'media',
      label: FIELD_LABELS.transactions.paymentProof,
    },
    {
      name: 'status',
      type: 'select',
      label: FIELD_LABELS.transactions.status,
      required: true,
      defaultValue: 'cho-xac-nhan',
      admin: {
        components: {
          Cell: '@/components/admin/transaction-status-cell#TransactionStatusCell',
        },
      },
      options: [
        { label: FIELD_LABELS.transactions.pending, value: 'cho-xac-nhan' },
        { label: FIELD_LABELS.transactions.paid, value: 'da-thanh-toan' },
        { label: FIELD_LABELS.transactions.rejected, value: 'tu-choi' },
        { label: FIELD_LABELS.transactions.unlocked, value: 'da-mo-khoa' },
      ],
    },
    {
      name: 'verifiedAt',
      type: 'date',
      label: FIELD_LABELS.transactions.verifiedAt,
    },
  ],
}

export default Transactions
