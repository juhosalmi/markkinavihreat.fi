import { describe, expect, it } from 'vitest'
import { assertTeamRefs, involvementFor, personPath } from '../../src/lib/team'

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
