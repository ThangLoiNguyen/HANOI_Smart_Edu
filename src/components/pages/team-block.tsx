import Image from 'next/image'
import type { Media, TeamBlock } from '@/payload-types'

function isMedia(value: NonNullable<TeamBlock['members']>[number]['photo']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

export function TeamBlockView({ block }: { block: TeamBlock }) {
  const members = block.members ?? []
  if (members.length === 0) return null

  return (
    <section>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => {
          const photo = isMedia(member.photo) ? member.photo : null
          return (
            <article
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              key={member.id ?? `${member.name}-${index}`}
            >
              {photo?.url ? (
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image
                    alt={photo.alt || member.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={photo.url}
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="p-5">
                <h2 className="text-lg font-extrabold text-blue-950">{member.name}</h2>
                {member.role ? <p className="mt-1 font-semibold text-orange-700">{member.role}</p> : null}
                {member.bio ? <p className="mt-3 text-sm leading-6 text-slate-600">{member.bio}</p> : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
