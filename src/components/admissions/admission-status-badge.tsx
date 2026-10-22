import type { Admission } from '@/payload-types'

const statusPresentation: Record<Admission['admissionStatus'], { label: string; className: string }> = {
  'dang-mo': { label: 'Đang mở', className: 'bg-emerald-100 text-emerald-800' },
  'da-dong': { label: 'Đã đóng', className: 'bg-slate-100 text-slate-700' },
}

export function AdmissionStatusBadge({ status }: { status: Admission['admissionStatus'] }) {
  const item = statusPresentation[status]
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.className}`}>{item.label}</span>
}
