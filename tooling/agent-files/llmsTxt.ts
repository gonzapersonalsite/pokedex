import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { absoluteUrl, DOCUMENTS, REPOSITORY_URL, SITE_DESCRIPTION, SITE_NAME } from './site.ts'

const ROOT = join(import.meta.dirname, '..', '..')

// A document of this repository as GitHub shows it on the default branch.
const repositoryDocumentUrl = (path: string): string => `${REPOSITORY_URL}/blob/main/${path}`

// The llmstxt.org format: a title, a one-line summary, and sections of links.
export const buildLlmsTxt = (): string => {
  const documents = DOCUMENTS.filter(([path]) => existsSync(join(ROOT, path))).map(
    ([path, description]) => `- [${path}](${repositoryDocumentUrl(path)}): ${description}`,
  )

  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'La aplicación dibuja sus vistas en el navegador con JavaScript, así que su HTML no tiene contenido legible: los enlaces de abajo la describen.',
    '',
    '## App',
    '',
    `- [Demo en vivo](${absoluteUrl('/')})`,
    '',
    '## Docs',
    '',
    ...documents,
    '',
  ].join('\n')
}
