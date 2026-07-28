import { describe, expect, it } from 'vitest'
import { localePath, parseLocalizedId } from '../../src/lib/content'

describe('parseLocalizedId', () => {
  it('splits a "<slug>.<locale>" id', () => {
    expect(parseLocalizedId('atte-harjanne.fi')).toEqual({ slug: 'atte-harjanne', locale: 'fi' })
  })

  it('keeps dots inside the slug intact', () => {
    expect(parseLocalizedId('2026-07-28-essayah-ruokaturva.sv')).toEqual({
      slug: '2026-07-28-essayah-ruokaturva',
      locale: 'sv',
    })
  })
})

describe('localePath', () => {
  it('leaves the default locale (fi) unprefixed', () => {
    expect(localePath('fi', '/manifesti/')).toBe('/manifesti/')
  })

  it('prefixes non-default locales', () => {
    expect(localePath('sv', '/manifesti/')).toBe('/sv/manifesti/')
    expect(localePath('en', 'manifesti/')).toBe('/en/manifesti/')
  })
})
