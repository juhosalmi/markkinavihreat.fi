import { describe, expect, it } from 'vitest'
import { parseProgramBody } from '../../src/lib/programSections'

const SAMPLE = `Lead paragraph one.

Lead paragraph two.

## Framing heading

Framing paragraph one.

Framing paragraph two.

## Vaatimus 1/5: First requirement

Requirement lead.

Requirement body.

## Vaatimus 2/5: Second requirement

Only paragraph.

## Yhteenveto: closing heading

Closing paragraph.
`

describe('parseProgramBody', () => {
  const parsed = parseProgramBody(SAMPLE)

  it('extracts the lead paragraphs before the first heading', () => {
    expect(parsed.leadParagraphs).toEqual(['Lead paragraph one.', 'Lead paragraph two.'])
  })

  it('classifies a heading with no numbering as a highlight section', () => {
    expect(parsed.sections[0]).toEqual({
      type: 'highlight',
      heading: 'Framing heading',
      paragraphs: ['Framing paragraph one.', 'Framing paragraph two.'],
    })
  })

  it('classifies "Word N/M: Title" headings as numbered requirements', () => {
    expect(parsed.sections[1]).toEqual({
      type: 'requirement',
      label: 'Vaatimus 1 / 5',
      index: 1,
      total: 5,
      heading: 'First requirement',
      paragraphs: ['Requirement lead.', 'Requirement body.'],
    })
    expect(parsed.sections[2]).toMatchObject({ type: 'requirement', index: 2, total: 5 })
  })

  it('strips a "Word: " label prefix and capitalizes the closing heading', () => {
    expect(parsed.sections[3]).toEqual({
      type: 'highlight',
      heading: 'Closing heading',
      paragraphs: ['Closing paragraph.'],
    })
  })

  it('returns no sections and empty lead for an empty body', () => {
    expect(parseProgramBody('')).toEqual({ leadParagraphs: [], sections: [] })
  })
})
