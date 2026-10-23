import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { Be_Vietnam_Pro } from 'next/font/google'
import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { NotificationPopup } from '@/components/layout/notification-popup'
import { PreviewBanner } from '@/components/layout/preview-banner'
import { LAYOUT_LABELS } from '@/lib/labels'
import { getSiteSettings } from '@/lib/metadata'
import { getGlobal } from '@/lib/payload'

import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})

type FrontendLayoutProps = {
  children: ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: settings.defaultSeo?.metaTitle || settings.siteName,
    description: settings.defaultSeo?.metaDescription || undefined,
    openGraph: {
      title: settings.defaultSeo?.metaTitle || settings.siteName,
      description: settings.defaultSeo?.metaDescription || undefined,
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function FrontendLayout({ children }: FrontendLayoutProps) {
  const [{ isEnabled: isDraft }, settings, navigation] = await Promise.all([
    draftMode(),
    getSiteSettings(),
    getGlobal<'navigation'>('navigation'),
  ])
  const popup = settings.notificationPopup
  const popupIsCurrent =
    popup?.enabled === true &&
    (!popup.expiresAt || new Date(popup.expiresAt).getTime() > Date.now())

  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} min-h-screen bg-[#f8fafc] font-sans text-slate-900 antialiased`}>
        <a
          className="sr-only z-[100] rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          href="#main-content"
        >
          {LAYOUT_LABELS.skipNavigation}
        </a>
        <Header menu={navigation.mainMenu ?? []} settings={settings} />
        <PreviewBanner initialIsDraft={isDraft} />
        <main id="main-content">{children}</main>
        <Footer menu={navigation.footerMenu ?? []} settings={settings} />
        {popupIsCurrent && popup ? <NotificationPopup data={popup} /> : null}
      </body>
    </html>
  )
}
