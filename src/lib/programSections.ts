export interface ProgramHighlightSection {
  type: 'highlight'
  heading: string
  paragraphs: string[]
}

export interface ProgramRequirementSection {
  type: 'requirement'
  label: string
  index: number
  total: number
  heading: string
  paragraphs: string[]
}

export type ProgramSection = ProgramHighlightSection | ProgramRequirementSection

export interface ParsedProgramBody {
  /** Paragraph(s) before the first heading — the hero's lead-in text. */
  leadParagraphs: string[]
  sections: ProgramSection[]
}

// "Vaatimus 1/5: ...", "Demand 1/5: ...", "Krav 1/5: ..." — the leading word
// is locale-specific, so we match its shape rather than any fixed language.
const REQUIREMENT_HEADING = /^(\S+)\s+(\d+)\/(\d+):\s*(.+)$/
// "Yhteenveto: ..." / "Summary: ..." — any other "Word: rest" heading. The
// original site never shows this label in the rendered heading, so we strip it.
const LABELED_HEADING = /^[^:]+:\s*(.+)$/

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Splits a program's markdown body into the hero lead-in and its `##`
 * sections, classifying each section as a numbered requirement ("Vaatimus
 * N/5: ...") or a plain highlight band (the framing intro and the closing
 * summary). Keeps content authoring in plain markdown while letting
 * ProgramDetailBody lay sections out with alternating styles and interleave
 * quote bands between them.
 */
export function parseProgramBody(body: string): ParsedProgramBody {
  const blocks = body.trim().split(/\n(?=## )/)

  let lead = ''
  let headingBlocks = blocks
  if (!blocks[0]?.startsWith('## ')) {
    lead = blocks[0] ?? ''
    headingBlocks = blocks.slice(1)
  }

  const sections: ProgramSection[] = headingBlocks.map((block) => {
    const newlineIndex = block.indexOf('\n')
    const headingLine = (newlineIndex === -1 ? block : block.slice(0, newlineIndex))
      .replace(/^##\s*/, '')
      .trim()
    const content = newlineIndex === -1 ? '' : block.slice(newlineIndex + 1)
    const paragraphs = splitParagraphs(content)

    const requirementMatch = headingLine.match(REQUIREMENT_HEADING)
    if (requirementMatch) {
      const [, word, index, total, title] = requirementMatch
      return {
        type: 'requirement',
        label: `${word} ${index} / ${total}`,
        index: Number(index),
        total: Number(total),
        heading: title,
        paragraphs,
      }
    }

    const labeledMatch = headingLine.match(LABELED_HEADING)
    return {
      type: 'highlight',
      heading: labeledMatch ? capitalize(labeledMatch[1]) : headingLine,
      paragraphs,
    }
  })

  return { leadParagraphs: splitParagraphs(lead), sections }
}
