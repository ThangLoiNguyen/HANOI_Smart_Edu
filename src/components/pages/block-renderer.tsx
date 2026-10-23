import type { Page } from '@/payload-types'

import { CtaBlockView } from '@/components/pages/cta-block'
import { ImageBlockView } from '@/components/pages/image-block'
import { StatsBlockView } from '@/components/pages/stats-block'
import { TeamBlockView } from '@/components/pages/team-block'
import { TextBlockView } from '@/components/pages/text-block'

type PageBlocks = NonNullable<Page['layout']>

export function BlockRenderer({ blocks }: { blocks: PageBlocks }) {
  return (
    <div className="space-y-12">
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`
        switch (block.blockType) {
          case 'textBlock':
            return <TextBlockView block={block} key={key} />
          case 'imageBlock':
            return <ImageBlockView block={block} key={key} />
          case 'statsBlock':
            return <StatsBlockView block={block} key={key} />
          case 'teamBlock':
            return <TeamBlockView block={block} key={key} />
          case 'ctaBlock':
            return <CtaBlockView block={block} key={key} />
        }
      })}
    </div>
  )
}
