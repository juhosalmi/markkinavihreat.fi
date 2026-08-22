import { describe, expect, it } from 'vitest'
import { parseProgramBody } from '../../src/lib/programSections'

const SAMPLE = `Lead paragraph one.

Lead paragraph two.

## Framing heading

Framing paragraph one.

> A pulled quote.

— Some Attribution

## Vaatimus 1/5: First requirement

Requirement lead.

Requirement body.

## Vaatimus 2/5: Second requirement

Only paragraph.

## Yhteenveto: closing heading

Closing paragraph.

## Usein kysytyt kysymykset

**Answered question?**
The answer.

**Unanswered question?**
`

describe('parseProgramBody', () => {
  const parsed = parseProgramBody(SAMPLE)

  it('extracts the lead paragraphs before the first heading as text', () => {
    expect(parsed.leadParagraphs).toEqual([
      { type: 'text', text: 'Lead paragraph one.' },
      { type: 'text', text: 'Lead paragraph two.' },
    ])
  })

  it('classifies a heading with no numbering as a highlight section', () => {
    expect(parsed.sections[0]).toEqual({
      type: 'highlight',
      heading: 'Framing heading',
      paragraphs: [
        { type: 'text', text: 'Framing paragraph one.' },
        { type: 'quote', text: 'A pulled quote.' },
        { type: 'attribution', text: '— Some Attribution' },
      ],
    })
  })

  it('classifies "Word N/M: Title" headings as numbered requirements', () => {
    expect(parsed.sections[1]).toEqual({
      type: 'requirement',
      label: 'Vaatimus 1 / 5',
      index: 1,
      total: 5,
      heading: 'First requirement',
      paragraphs: [
        { type: 'text', text: 'Requirement lead.' },
        { type: 'text', text: 'Requirement body.' },
      ],
    })
    expect(parsed.sections[2]).toMatchObject({ type: 'requirement', index: 2, total: 5 })
  })

  it('strips a "Word: " label prefix and capitalizes the closing heading', () => {
    expect(parsed.sections[3]).toEqual({
      type: 'highlight',
      heading: 'Closing heading',
      paragraphs: [{ type: 'text', text: 'Closing paragraph.' }],
    })
  })

  it('parses a block of "**Question**" paragraphs as an FAQ section', () => {
    expect(parsed.sections[4]).toEqual({
      type: 'faq',
      heading: 'Usein kysytyt kysymykset',
      items: [
        { question: 'Answered question?', answer: 'The answer.' },
        { question: 'Unanswered question?', answer: '' },
      ],
    })
  })

  it('returns no sections and empty lead for an empty body', () => {
    expect(parseProgramBody('')).toEqual({ leadParagraphs: [], sections: [] })
  })
})
