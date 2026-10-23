'use client'

import { useState } from 'react'

import { PREVIEW_BANNER_LABELS } from '@/lib/labels'

type PreviewBannerProps = {
  initialIsDraft: boolean
}

export function PreviewBanner({ initialIsDraft }: PreviewBannerProps) {
  const [isDraft] = useState(initialIsDraft)

  if (!isDraft) return null

  return (
    <div className="sticky top-0 z-50 flex min-h-12 items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-sm font-bold text-amber-950">
      <span aria-hidden="true">🔍</span>
      <span>{PREVIEW_BANNER_LABELS.message}</span>
      <a className="underline underline-offset-2" href="/api/exit-preview">
        {PREVIEW_BANNER_LABELS.exit}
      </a>
    </div>
  )
}
