import Image from 'next/image'
import Link from 'next/link'
import type { Media, Navigation, SiteSetting } from '@/payload-types'

import { MobileMenu } from '@/components/layout/mobile-menu'
import { LAYOUT_LABELS } from '@/lib/labels'

type MainMenuItem = NonNullable<Navigation['mainMenu']>[number]
type ResolvedMenuItem = {
  label: string
  href: string
  children: ResolvedMenuItem[]
}

const collectionPaths: Record<NonNullable<MainMenuItem['collection']>, string> = {
  posts: '/tin-tuc',
  courses: '/khoa-hoc',
  admissions: '/tuyen-sinh',
  achievements: '/thanh-tich',
  documents: '/tai-lieu',
  exams: '/ky-thi',
  albums: '/album',
  branches: '/co-so',
}

function resolveHref(item: MainMenuItem): string {
  if (item.type === 'external' && item.url) return item.url
  if (
    item.type === 'page' &&
    typeof item.page === 'object' &&
    item.page !== null &&
    'slug' in item.page &&
    typeof item.page.slug === 'string'
  ) {
    return `/${item.page.slug}`
  }
  if (item.type === 'collection' && item.collection) {
    return collectionPaths[item.collection]
  }
  return '/'
}

function resolveMenu(items: MainMenuItem[]): ResolvedMenuItem[] {
  return items.map((item) => ({
    label: item.label,
    href: resolveHref(item),
    children: resolveMenu(item.children ?? []),
  }))
}

function isMedia(value: SiteSetting['logo']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

type HeaderProps = {
  menu: MainMenuItem[]
  settings: SiteSetting
}

export function Header({ menu, settings }: HeaderProps) {
  const resolvedMenu =
    menu.length > 0
      ? resolveMenu(menu)
      : LAYOUT_LABELS.defaultMenu.map((item) => ({
          ...item,
          children: [],
        }))
  const logo = isMedia(settings.logo) ? settings.logo : null

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/" aria-label={settings.siteName}>
          {logo?.url ? (
            <Image
              src={logo.url}
              alt={logo.alt || settings.siteName}
              width={52}
              height={52}
              unoptimized
              className="h-12 w-12 shrink-0 object-contain"
            />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500 text-xl font-black text-white shadow-sm">
              H
            </span>
          )}
          <span className="truncate text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-lg">
            {settings.siteName}
          </span>
        </Link>

        <nav aria-label={LAYOUT_LABELS.menu} className="hidden items-center gap-1 xl:flex">
          {resolvedMenu.map((item) =>
            item.children.length > 0 ? (
              <details className="group relative" key={`${item.href}-${item.label}`}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700 [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <ChevronDown />
                </summary>
                <div className="absolute left-0 top-full min-w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {item.children.map((child) => (
                    <Link
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                      href={child.href}
                      key={`${child.href}-${child.label}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                href={item.href}
                key={`${item.href}-${item.label}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {settings.hotline ? (
            <a
              className="text-sm font-bold text-slate-700"
              href={`tel:${settings.hotline.replace(/[^\d+]/g, '')}`}
            >
              {settings.hotline}
            </a>
          ) : null}
          <Link
            className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            href="/lien-he"
          >
            {LAYOUT_LABELS.contact}
          </Link>
        </div>

        <MobileMenu items={resolvedMenu} hotline={settings.hotline} />
      </div>
    </header>
  )
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
