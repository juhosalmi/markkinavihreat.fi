import { describe, expect, it } from 'vitest'
import {
  assertTeamRefs,
  involvementFor,
  metaDescriptionFromBio,
  personPath,
} from '../../src/lib/team'

function program(
  id: string,
  opts: {
    order?: number
    unlisted?: boolean
    citations?: Array<{ person: string; quote: string }>
    contributors?: string[]
  } = {},
) {
  return {
    id,
    data: {
      order: opts.order ?? 1,
      unlisted: opts.unlisted ?? false,
      citations: opts.citations ?? [],
      contributors: opts.contributors ?? [],
    },
  }
}

function post(id: string, date: string, authors: string[]) {
  return { id, data: { date: new Date(date), authors } }
}

describe('personPath', () => {
  it('builds the localized person page path', () => {
    expect(personPath('fi', 'atte-harjanne')).toBe('/ketka/atte-harjanne/')
    expect(personPath('sv', 'atte-harjanne')).toBe('/sv/ketka/atte-harjanne/')
  })
})

describe('metaDescriptionFromBio', () => {
  it('takes the opening sentence, with link markup reduced to text', () => {
    expect(
      metaDescriptionFromBio(
        'Anna on [Esimerkkikunnan](https://example.fi) valtuutettu ja pitkän linjan aktiivi. Toinen lause.',
        'x',
      ),
    ).toBe('Anna on Esimerkkikunnan valtuutettu ja pitkän linjan aktiivi.')
  })

  it("doesn't stop at an abbreviation's period", () => {
    expect(
      metaDescriptionFromBio(
        'Timo is an M.Sc. graduate who works on energy markets and city planning. More.',
        'x',
      ),
    ).toBe('Timo is an M.Sc. graduate who works on energy markets and city planning.')
  })

  it('ends a sentence at a period closing a parenthesis', () => {
    expect(
      metaDescriptionFromBio(
        'Lauri on kunnanvaltuutettu ja johtava ohjelmistokehittäjä (DI, Aalto). Hänellä on lapsia.',
        'x',
      ),
    ).toBe('Lauri on kunnanvaltuutettu ja johtava ohjelmistokehittäjä (DI, Aalto).')
    expect(
      metaDescriptionFromBio(
        'Lauri är fullmäktigeledamot och ledande programutvecklare (DI, Aalto-universitetet). Mer.',
        'x',
      ),
    ).toBe('Lauri är fullmäktigeledamot och ledande programutvecklare (DI, Aalto-universitetet).')
  })

  it('cuts a long sentence at a word boundary', () => {
    const result = metaDescriptionFromBio(`${'sana '.repeat(60)}loppu.`, 'x')
    expect(result.length).toBeLessThanOrEqual(160)
    expect(result).toMatch(/sana…$/)
  })

  it('falls back when the bio is empty', () => {
    expect(metaDescriptionFromBio('  ', 'Anna — Markkinavihreät')).toBe('Anna — Markkinavihreät')
  })
})

describe('assertTeamRefs', () => {
  const team = ['anna.fi', 'anna.sv', 'bert.fi']

  it('accepts slugs that exist in the team collection', () => {
    expect(() =>
      assertTeamRefs(
        team,
        [program('p.fi', { citations: [{ person: 'anna', quote: 'q' }], contributors: ['bert'] })],
        [post('b.fi', '2026-01-01', ['anna'])],
      ),
    ).not.toThrow()
  })

  it('names every unknown slug and where it came from', () => {
    expect(() =>
      assertTeamRefs(
        team,
        [program('p.fi', { contributors: ['anan'] })],
        [post('b.sv', '2026-01-01', ['bret'])],
      ),
    ).toThrow(
      /programs\/p\.fi: unknown team member "anan"[\s\S]*blog\/b\.sv: unknown team member "bret"/,
    )
  })
})

describe('involvementFor', () => {
  it('collects cited and contributed programs in order, with the quote', () => {
    const programs = [
      program('late.fi', { order: 2, contributors: ['anna'] }),
      program('early.fi', { order: 1, citations: [{ person: 'anna', quote: 'Hyvä!' }] }),
      program('other.fi', { citations: [{ person: 'bert', quote: 'x' }] }),
    ]
    const result = involvementFor('anna', 'fi', programs, [])
    expect(result.programs.map((p) => [p.program.id, p.quote])).toEqual([
      ['early.fi', 'Hyvä!'],
      ['late.fi', undefined],
    ])
  })

  it('skips unlisted programs and other locales', () => {
    const programs = [
      program('hidden.fi', { unlisted: true, contributors: ['anna'] }),
      program('shown.sv', { contributors: ['anna'] }),
    ]
    expect(involvementFor('anna', 'fi', programs, []).programs).toEqual([])
  })

  it('lists authored posts newest first', () => {
    const posts = [
      post('old.fi', '2026-01-01', ['anna']),
      post('new.fi', '2026-06-01', ['bert', 'anna']),
      post('theirs.fi', '2026-03-01', ['bert']),
    ]
    expect(involvementFor('anna', 'fi', [], posts).posts.map((p) => p.id)).toEqual([
      'new.fi',
      'old.fi',
    ])
  })
})
