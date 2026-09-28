import { describe, expect, it } from 'vitest'
import {
  articleNode,
  breadcrumbNode,
  buildGraph,
  faqNode,
  organizationNode,
  ORGANIZATION_ID,
  personId,
  personNode,
  profilePageNode,
  teamCollectionNode,
} from '../../src/lib/structuredData'

const answered = [
  { question: 'Mikä on varallisuustili?', answer: 'Tili, jolle voi sijoittaa ennen verotusta.' },
]

describe('faqNode', () => {
  it('marks up a fully answered FAQ on an indexable page', () => {
    const node = faqNode(answered, { indexable: true })
    expect(node).toMatchObject({ '@type': 'FAQPage' })
    expect((node!.mainEntity as unknown[]).length).toBe(1)
  })

  it('emits nothing when any answer is still a placeholder', () => {
    const items = [...answered, { question: 'Entä verotus?', answer: '_Vastausta täydennetään._' }]
    expect(faqNode(items, { indexable: true })).toBeNull()
  })

  it('treats an empty or emphasis-only answer as unanswered', () => {
    expect(faqNode([{ question: 'Q?', answer: '' }], { indexable: true })).toBeNull()
    expect(faqNode([{ question: 'Q?', answer: '__' }], { indexable: true })).toBeNull()
    expect(
      faqNode([{ question: 'Q?', answer: '*Svar kommer senare.*' }], { indexable: true }),
    ).toBeNull()
  })

  it('keeps an answer that merely contains emphasis', () => {
    const items = [{ question: 'Q?', answer: 'Kyllä, _mutta_ vain osittain.' }]
    expect(faqNode(items, { indexable: true })).toMatchObject({ '@type': 'FAQPage' })
  })

  it('emits nothing for a noindex page, even when fully answered', () => {
    expect(faqNode(answered, { indexable: false })).toBeNull()
  })

  it('emits nothing when there are no questions', () => {
    expect(faqNode([], { indexable: true })).toBeNull()
  })
})

describe('articleNode', () => {
  const base = {
    url: 'https://markkinavihreat.fi/ehdotukset/lisaa-markkinoita/',
    headline: 'Lisää markkinoita!',
    description: 'Viisi ehdotusta.',
    locale: 'fi' as const,
    image: 'https://markkinavihreat.fi/images/og/fi-ehdotukset-lisaa-markkinoita.png',
    published: new Date('2026-07-28'),
  }

  it('references the shared Organization rather than restating it', () => {
    const node = articleNode(base)
    expect(node.author).toEqual({ '@id': ORGANIZATION_ID })
    expect(node.publisher).toEqual({ '@id': ORGANIZATION_ID })
  })

  it('falls back to datePublished when the entry was never updated', () => {
    expect(articleNode(base).dateModified).toBe(base.published.toISOString())
  })

  it('uses the update date when there is one', () => {
    const node = articleNode({ ...base, updated: new Date('2026-08-22') })
    expect(node.dateModified).toBe(new Date('2026-08-22').toISOString())
  })
})

describe('articleNode authors', () => {
  it('credits team members as Persons with name and url inline', () => {
    const node = articleNode({
      url: 'https://markkinavihreat.fi/blogi/2026-09-10/x/',
      headline: 'X',
      description: 'Y',
      locale: 'sv',
      image: 'https://markkinavihreat.fi/og.png',
      published: new Date('2026-09-10'),
      authors: [{ slug: 'anna', name: 'Anna', url: 'https://markkinavihreat.fi/sv/ketka/anna/' }],
    })
    expect(node.author).toEqual([
      {
        '@type': 'Person',
        '@id': personId('anna'),
        name: 'Anna',
        // The entity's url is the fi page whichever locale the article is in.
        url: 'https://markkinavihreat.fi/ketka/anna/',
      },
    ])
    expect(node.publisher).toEqual({ '@id': ORGANIZATION_ID })
  })
})

describe('personNode', () => {
  const base = {
    slug: 'anna',
    name: 'Anna',
    image: 'https://markkinavihreat.fi/images/team/Anna.jpg',
    description: 'Anna is a councillor.',
  }

  it('uses one locale-independent @id and belongs to the organization', () => {
    const node = personNode({ ...base, sameAs: [] })
    expect(node['@id']).toBe('https://markkinavihreat.fi/ketka/anna/#person')
    expect(node.url).toBe('https://markkinavihreat.fi/ketka/anna/')
    expect(node.memberOf).toEqual({ '@id': ORGANIZATION_ID })
  })

  it('omits sameAs when there are no profiles, and keeps them otherwise', () => {
    expect(personNode({ ...base, sameAs: [] })).not.toHaveProperty('sameAs')
    expect(personNode({ ...base, sameAs: ['https://example.fi/'] }).sameAs).toEqual([
      'https://example.fi/',
    ])
  })
})

describe('profilePageNode', () => {
  it('points mainEntity at the Person', () => {
    const node = profilePageNode('https://markkinavihreat.fi/ketka/anna/', 'anna', 'fi')
    expect(node.mainEntity).toEqual({ '@id': personId('anna') })
  })
})

describe('teamCollectionNode', () => {
  it('lists people in order, by their Person @id', () => {
    const node = teamCollectionNode('https://markkinavihreat.fi/ketka/', 'Ketkä', 'fi', [
      { slug: 'b', name: 'B', url: 'https://markkinavihreat.fi/ketka/b/' },
      { slug: 'a', name: 'A', url: 'https://markkinavihreat.fi/ketka/a/' },
    ])
    const list = node.mainEntity as { numberOfItems: number; itemListElement: unknown[] }
    expect(list.numberOfItems).toBe(2)
    expect(list.itemListElement[0]).toMatchObject({
      position: 1,
      item: { '@id': personId('b') },
    })
  })
})

describe('breadcrumbNode', () => {
  it('numbers the trail from 1', () => {
    const node = breadcrumbNode([
      { name: 'Markkinavihreät', url: 'https://markkinavihreat.fi/' },
      { name: 'Ehdotukset', url: 'https://markkinavihreat.fi/ehdotukset/' },
    ])
    expect(node.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Markkinavihreät',
        item: 'https://markkinavihreat.fi/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Ehdotukset',
        item: 'https://markkinavihreat.fi/ehdotukset/',
      },
    ])
  })
})

describe('buildGraph', () => {
  it('emits one @graph document with the organization first', () => {
    const parsed = JSON.parse(buildGraph([organizationNode('Verkosto.'), { '@type': 'WebSite' }]))
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@graph'][0]['@id']).toBe(ORGANIZATION_ID)
    expect(parsed['@graph'][1]['@type']).toBe('WebSite')
  })
})
