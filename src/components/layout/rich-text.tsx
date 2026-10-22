import type { ReactNode } from 'react'

type LexicalNode = Record<string, unknown>

function isRecord(value: unknown): value is LexicalNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getChildren(node: LexicalNode): unknown[] {
  return Array.isArray(node.children) ? node.children : []
}

function renderChildren(node: LexicalNode, key: string): ReactNode {
  return getChildren(node).map((child, index) => renderNode(child, `${key}-${index}`))
}

function safeHref(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (value.startsWith('/') || value.startsWith('#')) return value

  try {
    const url = new URL(value)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? value : undefined
  } catch {
    return undefined
  }
}

function renderNode(value: unknown, key: string): ReactNode {
  if (!isRecord(value)) return null

  if (value.type === 'text' && typeof value.text === 'string') {
    const format = typeof value.format === 'number' ? value.format : 0
    let text: ReactNode = value.text
    if ((format & 16) !== 0) text = <code>{text}</code>
    if ((format & 8) !== 0) text = <u>{text}</u>
    if ((format & 2) !== 0) text = <em>{text}</em>
    if ((format & 1) !== 0) text = <strong>{text}</strong>
    return <span key={key}>{text}</span>
  }

  const children = renderChildren(value, key)
  switch (value.type) {
    case 'root':
      return <div key={key}>{children}</div>
    case 'paragraph':
      return <p className="mb-3 last:mb-0" key={key}>{children}</p>
    case 'heading': {
      const tag = value.tag === 'h1' || value.tag === 'h2' || value.tag === 'h3' ? value.tag : 'h3'
      if (tag === 'h1') return <h1 className="mb-3 font-bold" key={key}>{children}</h1>
      if (tag === 'h2') return <h2 className="mb-3 font-bold" key={key}>{children}</h2>
      return <h3 className="mb-3 font-bold" key={key}>{children}</h3>
    }
    case 'quote':
      return <blockquote className="border-l-2 border-orange-400 pl-4 italic" key={key}>{children}</blockquote>
    case 'list':
      return value.listType === 'number' ? (
        <ol className="mb-3 list-decimal pl-5" key={key}>{children}</ol>
      ) : (
        <ul className="mb-3 list-disc pl-5" key={key}>{children}</ul>
      )
    case 'listitem':
      return <li key={key}>{children}</li>
    case 'link': {
      const href = isRecord(value.fields) ? safeHref(value.fields.url) : undefined
      return href ? (
        <a className="underline underline-offset-2 hover:text-orange-600" href={href} key={key}>
          {children}
        </a>
      ) : (
        <span key={key}>{children}</span>
      )
    }
    case 'linebreak':
      return <br key={key} />
    default:
      return <span key={key}>{children}</span>
  }
}

type RichTextProps = {
  data: unknown
  className?: string
}

export function RichText({ data, className }: RichTextProps) {
  if (!isRecord(data) || !isRecord(data.root)) return null
  return <div className={className}>{renderNode(data.root, 'root')}</div>
}
