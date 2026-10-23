import Image from 'next/image'
import Link from 'next/link'
import type { Navigation, SiteSetting } from '@/payload-types'

import { RichText } from '@/components/layout/rich-text'
import { findPublished } from '@/lib/payload'
import { CONTACT_LABELS, LAYOUT_LABELS } from '@/lib/labels'
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
          <div className="mb-5 flex items-center gap-4">
            {settings.facebookUrl ? (
              <a aria-label={LAYOUT_LABELS.socialLabels.facebook} className="text-slate-300 transition-colors hover:text-[#1877F2]" href={settings.facebookUrl} rel="noopener noreferrer" target="_blank">
                <SocialIcon name="facebook" />
              </a>
            ) : null}
            {settings.youtubeUrl ? (
              <a aria-label={LAYOUT_LABELS.socialLabels.youtube} className="text-slate-300 transition-colors hover:text-[#FF0033]" href={settings.youtubeUrl} rel="noopener noreferrer" target="_blank">
                <SocialIcon name="youtube" />
              </a>
            ) : null}
            {settings.zaloUrl ? (
              <a aria-label={LAYOUT_LABELS.socialLabels.zalo} className="text-slate-300 transition-colors hover:text-[#0068FF]" href={settings.zaloUrl} rel="noopener noreferrer" target="_blank">
                <SocialIcon name="zalo" />
              </a>
            ) : null}
            {settings.email ? (
              <a aria-label={CONTACT_LABELS.emailContact} className="text-slate-300 transition-colors hover:text-white" href={`mailto:${settings.email}`}>
                <SocialIcon name="email" />
              </a>
            ) : null}
            {settings.hotline ? (
              <a aria-label={CONTACT_LABELS.hotline} className="text-slate-300 transition-colors hover:text-orange-400" href={`tel:${settings.hotline.replace(/[^\d+]/g, '')}`}>
                <SocialIcon name="phone" />
              </a>
            ) : null}
          </div>
          <div className="space-y-2 text-blue-100/80">
            {settings.hotline ? (
              <a className="block text-lg font-bold text-white hover:text-orange-300" href={`tel:${settings.hotline.replace(/[^\d+]/g, '')}`}>
                {settings.hotline}
              </a>
            ) : null}
            {settings.email ? (
              <a className="block break-all text-base font-medium text-white hover:underline" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            ) : null}
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

function SocialIcon({ name }: { name: 'facebook' | 'youtube' | 'zalo' | 'email' | 'phone' }) {
  const className = 'h-6 w-6'

  switch (name) {
    case 'facebook':
      return (
        <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8M9.6 15.6V8.4l6.2 3.6z" />
        </svg>
      )
    case 'zalo':
      return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
          <path d="M3 6.5A3.5 3.5 0 0 1 6.5 3h11A3.5 3.5 0 0 1 21 6.5v9a3.5 3.5 0 0 1-3.5 3.5h-6l-5 3v-3.3A3.5 3.5 0 0 1 3 15.5z" fill="currentColor" />
          <text fill="#0f172a" fontSize="6" fontWeight="900" textAnchor="middle" x="12" y="13">ZALO</text>
        </svg>
      )
    case 'email':
      return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
          <path d="M3 6.5h18v11H3z" fill="currentColor" />
          <path d="m4 7 8 6 8-6" stroke="#0f172a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    case 'phone':
      return (
        <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02z" />
        </svg>
      )
  }
}
