import { absoluteUrl, COVER_ALT, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from './site.ts'

const replaceOnce = (html: string, pattern: RegExp, replacement: string, what: string): string => {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  const matches = html.match(new RegExp(pattern.source, flags)) ?? []
  if (matches.length !== 1) {
    throw new Error(`agent-files: expected exactly one ${what}, found ${matches.length}`)
  }

  return html.replace(pattern, () => replacement)
}

const updateMeta = (
  html: string,
  attribute: 'name' | 'property',
  name: string,
  content: string | ((current: string) => string),
): string => {
  const pattern = new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"\\s*/?>`, 'g')
  const matches = [...html.matchAll(pattern)]
  if (matches.length !== 1) {
    throw new Error(`agent-files: expected exactly one meta ${name}, found ${matches.length}`)
  }

  const next = typeof content === 'string' ? content : content(matches[0][1])
  return html.replace(matches[0][0], `<meta ${attribute}="${name}" content="${next}" />`)
}

const absoluteImagePath = (name: string) => (path: string): string => {
  if (!path.startsWith('/')) {
    throw new Error(`agent-files: ${name} must be a root-relative path, found "${path}"`)
  }
  return absoluteUrl(path)
}

export function buildShell(template: string): string {
  let html = replaceOnce(template, /<title>[\s\S]*?<\/title>/, `<title>${SITE_TITLE}</title>`, '<title>')
  html = updateMeta(html, 'name', 'description', SITE_DESCRIPTION)
  html = updateMeta(html, 'property', 'og:title', SITE_TITLE)
  html = updateMeta(html, 'property', 'og:description', SITE_DESCRIPTION)
  html = updateMeta(html, 'property', 'og:url', absoluteUrl('/'))
  html = updateMeta(html, 'property', 'og:site_name', SITE_NAME)
  html = updateMeta(html, 'property', 'og:locale', 'en_US')
  html = updateMeta(html, 'property', 'og:image', absoluteImagePath('og:image'))
  html = updateMeta(html, 'property', 'og:image:type', 'image/png')
  html = updateMeta(html, 'property', 'og:image:width', '1200')
  html = updateMeta(html, 'property', 'og:image:height', '630')
  html = updateMeta(html, 'property', 'og:image:alt', COVER_ALT)
  html = updateMeta(html, 'name', 'twitter:card', 'summary_large_image')
  html = updateMeta(html, 'name', 'twitter:title', SITE_TITLE)
  html = updateMeta(html, 'name', 'twitter:description', SITE_DESCRIPTION)
  html = updateMeta(html, 'name', 'twitter:image', absoluteImagePath('twitter:image'))
  html = updateMeta(html, 'name', 'twitter:image:alt', COVER_ALT)
  return html
}
