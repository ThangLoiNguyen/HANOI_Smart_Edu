import type { Branch, SiteSetting } from '@/payload-types'

import { CONTACT_LABELS } from '@/lib/labels'

type ContactInfoProps = {
  siteSettings: SiteSetting
  branch?: Branch
}

export function ContactInfo({ siteSettings, branch }: ContactInfoProps) {
  return (
    <aside className="h-fit rounded-2xl bg-blue-950 p-6 text-blue-50 sm:p-8">
      <h2 className="text-xl font-black text-white">{CONTACT_LABELS.branchInfo}</h2>
      <div className="mt-6 space-y-5 text-sm leading-6 text-blue-100">
        <div>
          <h3 className="font-bold text-white">{CONTACT_LABELS.address}</h3>
          <p className="mt-1">{branch?.address || CONTACT_LABELS.noBranch}</p>
        </div>
        {siteSettings.hotline ? (
          <div>
            <h3 className="font-bold text-white">{CONTACT_LABELS.hotline}</h3>
            <a
              className="mt-1 inline-flex min-h-11 items-center underline underline-offset-2 hover:text-white"
              href={`tel:${siteSettings.hotline.replace(/[^\d+]/g, '')}`}
            >
              {siteSettings.hotline}
            </a>
          </div>
        ) : null}
        {siteSettings.email ? (
          <div>
            <h3 className="font-bold text-white">{CONTACT_LABELS.emailContact}</h3>
            <a
              className="mt-1 inline-flex min-h-11 items-center break-all underline underline-offset-2 hover:text-white"
              href={`mailto:${siteSettings.email}`}
            >
              {siteSettings.email}
            </a>
          </div>
        ) : null}
        {branch?.phone ? (
          <div>
            <h3 className="font-bold text-white">{CONTACT_LABELS.phone}</h3>
            <a
              className="mt-1 inline-flex min-h-11 items-center underline underline-offset-2 hover:text-white"
              href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`}
            >
              {branch.phone}
            </a>
          </div>
        ) : null}
        {branch?.workingHours || siteSettings.workingHours ? (
          <div>
            <h3 className="font-bold text-white">{CONTACT_LABELS.workingHours}</h3>
            <p className="mt-1">{branch?.workingHours || siteSettings.workingHours}</p>
          </div>
        ) : null}
        {branch?.googleMapsUrl ? (
          <a
            className="inline-flex min-h-11 items-center font-bold text-orange-300 underline underline-offset-2 hover:text-white"
            href={branch.googleMapsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {CONTACT_LABELS.map}
          </a>
        ) : null}
      </div>
    </aside>
  )
}
