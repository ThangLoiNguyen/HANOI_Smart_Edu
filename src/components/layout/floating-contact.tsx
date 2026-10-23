'use client'

import { FLOATING_CONTACT_LABELS } from '@/lib/labels'

type FloatingContactProps = {
  hotline?: string | null
  zaloUrl?: string | null
  facebookUrl?: string | null
}

const buttonClassName =
  'group relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-white shadow-lg shadow-black/20 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900'

function Tooltip({ children }: { children: string }) {
  return (
    <span className="invisible pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded bg-black px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity md:group-hover:visible md:group-hover:opacity-100 md:group-focus-visible:visible md:group-focus-visible:opacity-100">
      {children}
    </span>
  )
}

export function FloatingContact({ hotline, zaloUrl, facebookUrl }: FloatingContactProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 md:bottom-8 md:right-6">
      {zaloUrl ? (
        <a
          aria-label={FLOATING_CONTACT_LABELS.chatZalo}
          className={`${buttonClassName} bg-[#0068FF]`}
          href={zaloUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ZaloIcon />
          <Tooltip>{FLOATING_CONTACT_LABELS.chatZalo}</Tooltip>
        </a>
      ) : null}
      {facebookUrl ? (
        <a
          aria-label={FLOATING_CONTACT_LABELS.message}
          className={`${buttonClassName} bg-[#0084FF]`}
          href={facebookUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessengerIcon />
          <Tooltip>{FLOATING_CONTACT_LABELS.message}</Tooltip>
        </a>
      ) : null}
      {hotline ? (
        <a
          aria-label={FLOATING_CONTACT_LABELS.callNow}
          className={`${buttonClassName} animate-pulse bg-[#f97316] motion-reduce:animate-none`}
          href={`tel:${hotline}`}
        >
          <PhoneIcon />
          <Tooltip>{FLOATING_CONTACT_LABELS.callNow}</Tooltip>
        </a>
      ) : null}
    </div>
  )
}

function ZaloIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 32 32">
      <path d="M5 7.5A4.5 4.5 0 0 1 9.5 3h13A4.5 4.5 0 0 1 27 7.5v12a4.5 4.5 0 0 1-4.5 4.5h-7l-6 5v-5.3A4.5 4.5 0 0 1 5 19.5z" fill="currentColor" />
      <text fill="#0068FF" fontSize="7" fontWeight="900" textAnchor="middle" x="16" y="16">ZALO</text>
    </svg>
  )
}

function MessengerIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 32 32">
      <path d="M16 3C8.82 3 3 8.38 3 15.02c0 3.57 1.7 6.77 4.38 8.9V29l4.62-2.54c1.25.37 2.59.57 4 .57 7.18 0 13-5.38 13-12.01S23.18 3 16 3" fill="currentColor" />
      <path d="m8.5 18.5 6-6.4 4.1 3.1 5-3.1-6 6.4-4.1-3.1z" fill="#0084FF" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02z" />
    </svg>
  )
}
