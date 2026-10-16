import { describe, expect, it } from 'vitest'
import { buildAgentFiles } from './generate'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from './site'

const sourceOf = (path: string): string => {
  const file = buildAgentFiles().find((candidate) => candidate.path === path)
  if (file === undefined) throw new Error(`no agent file ${path}`)
  return file.source
}

describe('buildAgentFiles', () => {
  it('publishes_llms_robots_and_sitemap_once_each', () => {
    const files = buildAgentFiles()

    expect(files.map((file) => file.path)).toEqual(['/llms.txt', '/robots.txt', '/sitemap.xml'])
    expect(files.every((file) => file.contentType.endsWith('; charset=utf-8'))).toBe(true)
  })

  it('points_robots_txt_at_the_sitemap', () => {
    const robots = sourceOf('/robots.txt')

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain(`Sitemap: ${absoluteUrl('/sitemap.xml')}`)
  })

  it('lists_only_the_site_root_in_the_sitemap', () => {
    const sitemap = sourceOf('/sitemap.xml')
    const locations = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1])

    expect(locations).toEqual([absoluteUrl('/')])
  })

  it('summarizes_the_site_with_verified_repo_links_in_llms_txt', () => {
    const llms = sourceOf('/llms.txt')

    expect(llms).toContain(`# ${SITE_NAME}`)
    expect(llms).toContain(`> ${SITE_DESCRIPTION}`)
    expect(llms).toContain(`](${absoluteUrl('/')})`)
    expect(llms).toContain('https://github.com/gonzapersonalsite/pokedex/blob/main/README.md')
    expect(llms).toContain('https://github.com/gonzapersonalsite/pokedex/blob/main/ARCHITECTURE.md')
    expect(llms).toContain('https://github.com/gonzapersonalsite/pokedex/blob/main/OPERATIONS.md')
  })
})
