import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from './site.ts'

export interface AgentFile {
  path: string
  source: string
  contentType: string
}

const buildLlmsTxt = (): string =>
  [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Links',
    `- [Live demo](${absoluteUrl('/')})`,
    '- [README](https://github.com/gonzapersonalsite/pokedex/blob/main/README.md)',
    '- [Architecture Guide](https://github.com/gonzapersonalsite/pokedex/blob/main/ARCHITECTURE.md)',
    '- [Operations Guide](https://github.com/gonzapersonalsite/pokedex/blob/main/OPERATIONS.md)',
    '',
    '## Summary',
    '- React + Vite + TypeScript single-page application.',
    '- Reads public PokéAPI endpoints in the browser.',
    '- Supports search, type filters, favorites, evolution details and PWA installability.',
    '',
  ].join('\n')

const buildRobotsTxt = (): string =>
  ['User-agent: *', 'Allow: /', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join('\n')

const buildSitemapXml = (): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${absoluteUrl('/')}</loc></url>`,
    '</urlset>',
    '',
  ].join('\n')

export const buildAgentFiles = (): AgentFile[] => [
  {
    path: '/llms.txt',
    source: buildLlmsTxt(),
    contentType: 'text/plain; charset=utf-8',
  },
  {
    path: '/robots.txt',
    source: buildRobotsTxt(),
    contentType: 'text/plain; charset=utf-8',
  },
  {
    path: '/sitemap.xml',
    source: buildSitemapXml(),
    contentType: 'application/xml; charset=utf-8',
  },
]
