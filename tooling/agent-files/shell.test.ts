import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildShell } from './shell'
import { COVER_ALT, COVER_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from './site'

const ROOT = join(import.meta.dirname, '..', '..')
const INDEX_HTML = readFileSync(join(ROOT, 'index.html'), 'utf8')
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const metaContent = (html: string, attribute: 'name' | 'property', name: string): string[] =>
  [...html.matchAll(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`, 'g'))].map((match) => match[1])

describe('buildShell', () => {
  it('writes_the_site_title_and_description_when_the_template_holds_other_values', () => {
    const template = INDEX_HTML.replace(/<title>[^<]*<\/title>/, '<title>dev title</title>').replace(
      /(<meta (?:name="description"|property="og:title"|property="og:description"|name="twitter:title"|name="twitter:description") content=")[^"]*"/g,
      '$1dev value"',
    )

    const shell = buildShell(template)

    expect(shell.match(/<title>[^<]*<\/title>/g)).toEqual([`<title>${SITE_TITLE}</title>`])
    expect(metaContent(shell, 'name', 'description')).toEqual([SITE_DESCRIPTION])
    expect(metaContent(shell, 'property', 'og:title')).toEqual([SITE_TITLE])
    expect(metaContent(shell, 'property', 'og:description')).toEqual([SITE_DESCRIPTION])
    expect(metaContent(shell, 'name', 'twitter:title')).toEqual([SITE_TITLE])
    expect(metaContent(shell, 'name', 'twitter:description')).toEqual([SITE_DESCRIPTION])
  })

  it('points_the_social_preview_at_absolute_site_addresses', () => {
    const shell = buildShell(INDEX_HTML)

    expect(metaContent(shell, 'property', 'og:url')).toEqual([`${SITE_URL}/`])
    expect(metaContent(shell, 'property', 'og:site_name')).toEqual([SITE_NAME])
    expect(metaContent(shell, 'property', 'og:locale')).toEqual(['en_US'])
    expect(metaContent(shell, 'property', 'og:image')).toEqual([`${SITE_URL}${COVER_PATH}`])
    expect(metaContent(shell, 'name', 'twitter:image')).toEqual([`${SITE_URL}${COVER_PATH}`])
  })

  it('declares_the_real_type_size_and_alt_of_the_cover', () => {
    const shell = buildShell(INDEX_HTML)
    const cover = readFileSync(join(ROOT, 'public', COVER_PATH.slice(1)))
    const size = { width: cover.readUInt32BE(16), height: cover.readUInt32BE(20) }

    expect(cover.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)).toBe(true)
    expect(metaContent(shell, 'property', 'og:image:type')).toEqual(['image/png'])
    expect(metaContent(shell, 'property', 'og:image:width')).toEqual([String(size.width)])
    expect(metaContent(shell, 'property', 'og:image:height')).toEqual([String(size.height)])
    expect(metaContent(shell, 'property', 'og:image:alt')).toEqual([COVER_ALT])
    expect(metaContent(shell, 'name', 'twitter:image:alt')).toEqual([COVER_ALT])
    expect(size).toEqual({ width: 1200, height: 630 })
  })

  it('refuses_a_social_image_that_is_not_root_relative_in_the_template', () => {
    const hardcoded = INDEX_HTML.replace(
      /<meta property="og:image" content="\/og-cover\.png"\s*\/>/,
      '<meta property="og:image" content="https://example.com/og-cover.png" />',
    )

    expect(() => buildShell(hardcoded)).toThrow(/og:image must be a root-relative path/)
  })
})
