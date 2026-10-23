import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface HeaderRule {
  source: string
  headers: { key: string; value: string }[]
}

interface VercelConfig {
  headers: HeaderRule[]
}

const ROOT = join(import.meta.dirname, '..', '..')
const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as VercelConfig

const headerOf = (source: string, key: string): string | undefined =>
  config.headers.find((rule) => rule.source === source)?.headers.find((header) => header.key === key)?.value

describe('vercel.json', () => {
  it('serves the content-hashed assets from /assets/ as immutable', () => {
    expect(headerOf('/assets/(.*)', 'Cache-Control')).toBe('public, max-age=31536000, immutable')
  })
})
