import type { Exam } from '@/payload-types'

const statusPresentation: Record<Exam['examStatus'], { label: string; className: string }> = {
  'sap-dien-ra': { label: 'Sắp diễn ra', className: 'bg-sky-100 text-sky-800' },
  'dang-dien-ra': { label: 'Đang diễn ra', className: 'bg-orange-100 text-orange-800' },
  'da-ket-thuc': { label: 'Đã kết thúc', className: 'bg-slate-100 text-slate-700' },
}

export function ExamStatusBadge({ status }: { status: Exam['examStatus'] }) {
  const item = statusPresentation[status]
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.className}`}>{item.label}</span>
}
