import type { Media } from '@/payload-types'

const placeholderFilenamePrefix = 'test-placeholder-'
const placeholderSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">',
  '<rect width="1200" height="800" fill="#e0f2fe"/>',
  '<circle cx="600" cy="400" r="190" fill="#fff7ed"/>',
  '<text x="600" y="430" text-anchor="middle" font-family="Arial,sans-serif" font-size="92" font-weight="700" fill="#1e3a8a">HSE</text>',
  '</svg>',
].join('')

const placeholderDataUrl = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`

export function getAlbumImageSource(image: Media): string | undefined {
  if (image.filename?.startsWith(placeholderFilenamePrefix)) return placeholderDataUrl
  return image.url ?? undefined
}
