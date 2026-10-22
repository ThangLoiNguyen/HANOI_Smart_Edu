import { POSTS_LABELS } from '@/lib/labels'

type PostType = 'tin-tuc' | 'su-kien' | 'bao-chi'

const typeStyles: Record<PostType, { label: string; className: string }> = {
  'tin-tuc': {
    label: POSTS_LABELS.typeNews,
    className: 'bg-sky-100 text-sky-800',
  },
  'su-kien': {
    label: POSTS_LABELS.typeEvent,
    className: 'bg-orange-100 text-orange-800',
  },
  'bao-chi': {
    label: POSTS_LABELS.typePress,
    className: 'bg-violet-100 text-violet-800',
  },
}

export function TypeBadge({ type }: { type: PostType }) {
  const { label, className } = typeStyles[type]

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  )
}
