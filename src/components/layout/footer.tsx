import Image from 'next/image'
import Link from 'next/link'
import type { Navigation, SiteSetting } from '@/payload-types'

import { RichText } from '@/components/layout/rich-text'
import { findPublished } from '@/lib/payload'
import { LAYOUT_LABELS } from '@/lib/labels'
import type { Media } from '@/payload-types'

type FooterMenuItem = NonNullable<Navigation['footerMenu']>[number]

const collectionPaths: Record<NonNullable<FooterMenuItem['collection']>, string> = {
  posts: '/tin-tuc',
  courses: '/khoa-hoc',
  admissions: '/tuyen-sinh',
  achievements: '/thanh-tich',
  documents: '/tai-lieu',
  exams: '/ky-thi',
  albums: '/album',
  branches: '/co-so',
}

function hrefFor(item: FooterMenuItem): string {
  if (item.type === 'external' && item.url) return item.url
  if (
    item.type === 'page' &&
    typeof item.page === 'object' &&
    item.page !== null &&
    typeof item.page.slug === 'string'
  ) {
    return `/${item.page.slug}`
  }
  if (item.type === 'collection' && item.collection) return collectionPaths[item.collection]
  return '/'
}

function isMedia(value: SiteSetting['logo']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

type FooterProps = {
  menu: FooterMenuItem[]
  settings: SiteSetting
}

export async function Footer({ menu, settings }: FooterProps) {
  const branchesResult = await findPublished('branches', { limit: 1, sort: 'order' })
  const branch = branchesResult.docs[0]
  const logo = isMedia(settings.logo) ? settings.logo : null
  const footerLinks =
    menu.length > 0
      ? menu.map((item) => ({ label: item.label, href: hrefFor(item) }))
      : LAYOUT_LABELS.defaultMenu

  return (
    <footer className="mt-20 bg-blue-950 text-blue-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <section>
          <Link className="mb-5 flex items-center gap-3" href="/">
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || settings.siteName}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 rounded-xl bg-white object-contain p-1"
              />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500 text-xl font-black text-white">
                H
              </span>
            )}
            <span className="text-lg font-extrabold">{settings.siteName}</span>
          </Link>
          <div className="space-y-2 text-sm leading-6 text-blue-100/80">
            <p className="font-semibold text-white">{LAYOUT_LABELS.campusAddress}</p>
            <p>{branch?.address || settings.siteName}</p>
            {settings.workingHours ? <p>{settings.workingHours}</p> : null}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-orange-300">
            {LAYOUT_LABELS.quickLinks}
          </h2>
          <nav className="grid grid-cols-2 gap-x-4 gap-y-2">
            {footerLinks.map((item) => (
              <Link
                className="min-h-10 content-center text-sm text-blue-100/80 transition hover:text-white"
                href={item.href}
                key={`${item.label}-${item.href}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-orange-300">
            {LAYOUT_LABELS.socialLinks}
          </h2>
          <div className="space-y-3 text-sm text-blue-100/80">
            {settings.hotline ? (
              <a className="block min-h-10 content-center font-bold text-white" href={`tel:${settings.hotline.replace(/[^\d+]/g, '')}`}>
                {settings.hotline}
              </a>
            ) : null}
            {settings.email ? <a className="block min-h-10 content-center" href={`mailto:${settings.email}`}>{settings.email}</a> : null}
            {settings.zaloUrl ? <a className="block min-h-10 content-center" href={settings.zaloUrl} rel="noreferrer" target="_blank">{LAYOUT_LABELS.socialLabels.zalo}</a> : null}
            {settings.facebookUrl ? <a className="block min-h-10 content-center" href={settings.facebookUrl} rel="noreferrer" target="_blank">{LAYOUT_LABELS.socialLabels.facebook}</a> : null}
            {settings.youtubeUrl ? <a className="block min-h-10 content-center" href={settings.youtubeUrl} rel="noreferrer" target="_blank">{LAYOUT_LABELS.socialLabels.youtube}</a> : null}
          </div>
        </section>
      </div>
      {settings.footerContent ? (
        <div className="border-t border-white/10">
          <RichText
            className="mx-auto max-w-7xl px-4 py-5 text-sm leading-6 text-blue-100/70 sm:px-6 lg:px-8"
            data={settings.footerContent}
          />
        </div>
      ) : null}
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-blue-100/50">
        © {new Date().getFullYear()} {settings.siteName}
      </div>
    </footer>
  )
}
