'use client'

import Link from 'next/link'
import { useState } from 'react'

import { LAYOUT_LABELS } from '@/lib/labels'

export type ResolvedMenuItem = {
  label: string
  href: string
  children: ResolvedMenuItem[]
}

type MobileMenuProps = {
  items: ResolvedMenuItem[]
  hotline?: string | null
}

export function MobileMenu({ items, hotline }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="xl:hidden">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label={open ? LAYOUT_LABELS.closeMenu : LAYOUT_LABELS.openMenu}
        className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <div
          className="fixed inset-x-0 top-20 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-8 pt-3 shadow-xl sm:px-6"
          id="mobile-navigation"
        >
          <nav aria-label={LAYOUT_LABELS.menu} className="mx-auto flex max-w-7xl flex-col">
            {items.map((item) =>
              item.children.length > 0 ? (
                <details className="group border-b border-slate-100" key={`${item.href}-${item.label}`}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-2 text-base font-semibold [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <ChevronDown className="transition-transform duration-150 group-open:rotate-180" />
                  </summary>
                  <div className="pb-2 pl-4">
                    {item.children.map((child) => (
                      <Link
                        className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                        href={child.href}
                        key={`${child.href}-${child.label}`}
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  className="flex min-h-12 items-center border-b border-slate-100 text-base font-semibold"
                  href={item.href}
                  key={`${item.href}-${item.label}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            {hotline ? (
              <a
                className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-blue-950 px-4 font-bold text-white"
                href={`tel:${hotline.replace(/[^\d+]/g, '')}`}
              >
                {hotline}
              </a>
            ) : null}
            <Link
              className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-4 font-bold text-white"
              href="/lien-he"
              onClick={() => setOpen(false)}
            >
              {LAYOUT_LABELS.contact}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  )
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
