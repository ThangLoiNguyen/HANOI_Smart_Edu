'use client'

import type { DefaultCellComponentProps } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

const STATUS_BADGES: Record<string, { background: string; foreground: string; label: string }> = {
  'cho-xac-nhan': {
    background: '#fef3c7',
    foreground: '#92400e',
    label: FIELD_LABELS.transactions.pending,
  },
  'da-thanh-toan': {
    background: '#d1fae5',
    foreground: '#065f46',
    label: FIELD_LABELS.transactions.paid,
  },
  'tu-choi': {
    background: '#fee2e2',
    foreground: '#991b1b',
    label: FIELD_LABELS.transactions.rejected,
  },
  'da-mo-khoa': {
    background: '#dbeafe',
    foreground: '#1e40af',
    label: FIELD_LABELS.transactions.unlocked,
  },
}

export function TransactionStatusCell({ cellData }: DefaultCellComponentProps) {
  const status = typeof cellData === 'string' ? cellData : ''
  const badge = STATUS_BADGES[status]

  return (
    <span
      style={{
        alignItems: 'center',
        backgroundColor: badge?.background ?? '#f1f5f9',
        borderRadius: '9999px',
        color: badge?.foreground ?? '#475569',
        display: 'inline-flex',
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: 1.4,
        padding: '3px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      {badge?.label ?? (status || '—')}
    </span>
  )
}