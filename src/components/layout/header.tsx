import Link from 'next/link'
import type { Navigation, SiteSetting } from '@/payload-types'

import { MobileMenu } from '@/components/layout/mobile-menu'
import { SearchModal } from '@/components/layout/search-modal'
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

function containsMenuHref(items: ResolvedMenuItem[], href: string): boolean {
  return items.some((item) => item.href === href || containsMenuHref(item.children, href))
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
          children: item.children.map((child) => ({ ...child, children: [] })),
        }))
  const mainMenuItems = containsMenuHref(resolvedMenu, '/kiem-tra-dau-vao')
    ? resolvedMenu
    : [
        ...resolvedMenu,
        {
          label: LAYOUT_LABELS.placementTest,
          href: '/kiem-tra-dau-vao',
          children: [],
        },
      ]
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <a className="flex shrink-0 items-center gap-3" aria-label="HANOI Smart Edu" href="/">
          <img src="/logo.svg" alt="HANOI Smart Edu" className="h-12 w-auto object-contain" />
        </a>

        <nav aria-label={LAYOUT_LABELS.menu} className="hidden items-center gap-3 xl:flex">
          {mainMenuItems.map((item, index) => {
            const hasChildren = item.children.length > 0

            return (
              <div className="group relative z-50 flex items-center" key={`${item.href}-${item.label}-${index}`}>
                <a
                  className="flex min-h-11 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                  href={item.href || '#'}
                >
                  {item.label}
                  {hasChildren ? <ChevronDown className="transition-transform group-hover:rotate-180" /> : null}
                </a>

                {hasChildren ? (
                  <div className="invisible absolute left-0 top-full z-50 min-w-[220px] translate-y-2 rounded-xl border border-slate-200 bg-white p-2 pt-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child, childIndex) => (
                      <a
                        className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                        href={child.href || '#'}
                        key={`${child.href}-${child.label}-${childIndex}`}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-3 xl:flex">
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
          <SearchModal />
          <MobileMenu items={mainMenuItems} hotline={settings.hotline} />
        </div>
      </div>
    </header>
  )
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
