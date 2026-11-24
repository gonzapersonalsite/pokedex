import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import globalStyles from './index.css?raw'

// A text size in pixels ignores the font size the reader set in the browser; rem follows it.
const PIXEL_TEXT_SIZES = [
  /\btext-\[(?:length:)?[\d.]+px\]/g,
  /\bfont(?:-size)?:[^;{}]*?[\d.]+px/g,
  /\bfontSize:\s*(?:['"`]?[\d.]+px|\d)/g,
]

const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

function pixelTextSizesIn(files: Record<string, string>): string[] {
  return Object.entries(files).flatMap(([path, text]) =>
    PIXEL_TEXT_SIZES.flatMap((pattern) => [...text.matchAll(pattern)].map(([match]) => `${path}: ${match}`)),
  )
}

describe('text sizes', () => {
  it('finds_a_pixel_size_written_as_a_class_as_css_or_as_an_inline_style', () => {
    const found = pixelTextSizesIn({
      'class.tsx': '<p className="sm:text-[11px]" />',
      'styles.css': '.brand { font-size: 18px; } .page { font: bold 18px/1.45 sans-serif; }',
      'inline.tsx': "<p style={{ fontSize: '10px' }} /> <p style={{ fontSize: 12 }} />",
      'relative.tsx': '<p className="text-[0.6875rem] text-sm" style={{ fontSize: \'1rem\' }} />',
      'boxes.css': '.box { border: 3px solid; font: 1rem/1.5 system-ui; min-height: 300px; }',
    })

    expect(found).toEqual([
      'class.tsx: text-[11px]',
      'styles.css: font-size: 18px',
      'styles.css: font: bold 18px',
      "inline.tsx: fontSize: '10px",
      'inline.tsx: fontSize: 1',
    ])
  })

  it('never_sizes_text_in_pixels_so_it_follows_the_font_size_of_the_browser', () => {
    // The glob reaches this folder and the layers below it: an empty one would read as no pixel size.
    expect(Object.keys(sources)).toEqual(expect.arrayContaining(['./App.tsx', '../shared/ui/Button.tsx']))

    expect(pixelTextSizesIn({ ...sources, 'src/app/index.css': globalStyles, 'index.html': indexHtml })).toEqual([])
  })
})
