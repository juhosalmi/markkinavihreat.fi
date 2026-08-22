import { marked } from 'marked'

/**
 * Renders a single line/paragraph of trusted, locally-authored markdown
 * (bold, links) to inline HTML — no wrapping <p>, no block elements.
 * Used for paragraphs read out of content collection entries, which are
 * inserted with `set:html`.
 */
export function renderInlineMarkdown(text: string): string {
  return marked.parseInline(text, { async: false }) as string
}
