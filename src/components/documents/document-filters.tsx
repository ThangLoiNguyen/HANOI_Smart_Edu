'use client'

import type { Document } from '@/payload-types'

import { DOCUMENTS_LABELS } from '@/lib/labels'

export type DocumentFiltersValue = {
  type: 'all' | Document['type']
  grade: 'all' | Document['grade']
  subject: 'all' | Document['subject']
  year: 'all' | number
}

type DocumentFiltersProps = {
  value: DocumentFiltersValue
  years: number[]
  onChange: (value: DocumentFiltersValue) => void
}

export function DocumentFilters({ value, years, onChange }: DocumentFiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {DOCUMENTS_LABELS.type}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({ ...value, type: event.target.value as DocumentFiltersValue['type'] })
          }
          value={value.type}
        >
          <option value="all">{DOCUMENTS_LABELS.all}</option>
          {Object.entries(DOCUMENTS_LABELS.types).map(([type, label]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {DOCUMENTS_LABELS.grade}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({ ...value, grade: event.target.value as DocumentFiltersValue['grade'] })
          }
          value={value.grade}
        >
          <option value="all">{DOCUMENTS_LABELS.all}</option>
          {Object.entries(DOCUMENTS_LABELS.grades).map(([grade, label]) => (
            <option key={grade} value={grade}>{label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {DOCUMENTS_LABELS.subject}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({ ...value, subject: event.target.value as DocumentFiltersValue['subject'] })
          }
          value={value.subject}
        >
          <option value="all">{DOCUMENTS_LABELS.all}</option>
          {Object.entries(DOCUMENTS_LABELS.subjects).map(([subject, label]) => (
            <option key={subject} value={subject}>{label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {DOCUMENTS_LABELS.year}
        <select
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
          onChange={(event) =>
            onChange({
              ...value,
              year: event.target.value === 'all' ? 'all' : Number(event.target.value),
            })
          }
          value={value.year}
        >
          <option value="all">{DOCUMENTS_LABELS.all}</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
    </div>
  )
}
