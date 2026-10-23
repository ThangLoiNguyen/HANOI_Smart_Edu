import { RichText } from '@/components/layout/rich-text'
import type { TextBlock } from '@/payload-types'

export function TextBlockView({ block }: { block: TextBlock }) {
  if (!block.heading && !block.body) return null

  return (
    <section>
      {block.heading ? (
        <h2 className="mb-4 text-2xl font-black text-blue-950 sm:text-3xl">{block.heading}</h2>
      ) : null}
      {block.body ? (
        <RichText className="prose prose-slate max-w-none leading-8" data={block.body} />
      ) : null}
    </section>
  )
}
