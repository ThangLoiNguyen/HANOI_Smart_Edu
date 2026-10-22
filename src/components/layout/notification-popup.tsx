'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { LAYOUT_LABELS } from '@/lib/labels'
import type { Media, SiteSetting } from '@/payload-types'

type PopupData = NonNullable<SiteSetting['notificationPopup']>

function isMedia(value: PopupData['image']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

type NotificationPopupProps = {
  data: PopupData
}

export function NotificationPopup({ data }: NotificationPopupProps) {
  const [visible, setVisible] = useState(false)
  const storageKey = 'hanoi-smart-edu-notification-dismissed'
  const image = isMedia(data.image) ? data.image : null

  useEffect(() => {
    if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) return
    setVisible(window.localStorage.getItem(storageKey) !== 'true')
  }, [data.expiresAt])

  if (!data.enabled || !visible) return null

  function dismiss() {
    window.localStorage.setItem(storageKey, 'true')
    setVisible(false)
  }

  const popupContent = image?.url ? (
    <Image
      alt={image.alt || LAYOUT_LABELS.notificationImageAlt}
      className="h-auto max-h-[55vh] w-full object-cover"
      height={image.height || 420}
      src={image.url}
      unoptimized
      width={image.width || 560}
    />
  ) : null

  return (
    <aside
      aria-label={LAYOUT_LABELS.notification}
      className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      role="dialog"
    >
      <button
        aria-label={LAYOUT_LABELS.close}
        className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-slate-800 shadow transition hover:bg-white"
        onClick={dismiss}
        type="button"
      >
        <CloseIcon />
      </button>
      {data.link ? (
        <Link href={data.link} onClick={dismiss}>
          {popupContent}
        </Link>
      ) : (
        popupContent
      )}
    </aside>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}
