import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import globalStyles from './index.css?raw'

// Nothing moves for a reader who asked the system for less motion
// (#reduced-motion-covers-only-part-of-the-animations). Motion gets in through a class, through a
// stylesheet or through a scripted scroll, and each way in has its guard.

const TRANSITION_GUARD = 'motion-reduce:transition-none'
const TRANSITION_UTILITY = /^(?:transition(?:-(?!none$)[a-z[\]-]+)?|duration-\S+)$/
const ANIMATION_UTILITY = /^animate-(?:spin|ping|pulse|bounce|\[.+\])$/
const QUOTED = /(['"`])(.*?)\1/g
const MOTION_DECLARATION = /\b(?:animation|transition)(?:-[a-z-]+)?\s*:|\bscroll-behavior\s*:\s*smooth/g
const SMOOTH_SCROLL = /['"`]smooth['"`]/
const SCROLL_BEHAVIOR_OWNER = '../shared/utils/scroll.ts'

const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** The utility of a class without its variants: `sm:hover:transition` is `transition`. */
const utilityOf = (className: string) => className.slice(className.lastIndexOf(':') + 1)

/** Classes that start a transition or an animation and would still do so with reduced motion asked for. */
function unguardedMotionClassesIn(files: Record<string, string>): string[] {
  return Object.entries(files).flatMap(([path, text]) =>
    text.split('\n').flatMap((line) =>
      [...line.matchAll(QUOTED)].flatMap(([, , quoted]) => {
        const classes = quoted.split(/\s+/)
        const transitions = classes.includes(TRANSITION_GUARD)
          ? []
          : classes.filter((className) => TRANSITION_UTILITY.test(utilityOf(className)))
        const animations = classes.filter(
          (className) => ANIMATION_UTILITY.test(utilityOf(className)) && !className.split(':').includes('motion-safe'),
        )
        return [...transitions, ...animations].map((className) => `${path}: ${className}`)
      }),
    ),
  )
}

/** The text of a stylesheet without its `@media (prefers-reduced-motion: no-preference)` blocks. */
function withoutMotionOptIns(css: string): string {
  const optIn = /@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{/g
  let rest = ''
  let from = 0
  for (const match of css.matchAll(optIn)) {
    if (match.index < from) continue
    let depth = 1
    let at = match.index + match[0].length
    while (depth > 0 && at < css.length) {
      if (css[at] === '{') depth += 1
      if (css[at] === '}') depth -= 1
      at += 1
    }
    rest += css.slice(from, match.index)
    from = at
  }
  return rest + css.slice(from)
}

/** Declarations that animate, transition or scroll smoothly whatever the reader asked for. */
function ungatedMotionDeclarationsIn(files: Record<string, string>): string[] {
  return Object.entries(files).flatMap(([path, css]) =>
    [...withoutMotionOptIns(css).matchAll(MOTION_DECLARATION)].map(([match]) => `${path}: ${match}`),
  )
}

describe('reduced motion', () => {
  it('finds_a_transition_or_an_animation_class_that_ignores_the_preference', () => {
    const found = unguardedMotionClassesIn({
      'bare.tsx': '<a className="transition hover:scale-110" /> <b className="sm:transition-all duration-300" />',
      'guarded.tsx': '<a className="transition motion-reduce:transition-none hover:scale-110 duration-300" />',
      'loops.tsx': '<i className="animate-spin" /> <i className="motion-safe:animate-pulse sm:animate-[wiggle_1s]" />',
      'headless.tsx': '<Panel enter="ease-out data-enter:duration-1000" />',
      'prose.tsx': 'const copy = \'A smooth transition\'\n// the panel transition\n<p className="transition-none" />',
    })

    expect(found).toEqual([
      'bare.tsx: transition',
      'bare.tsx: sm:transition-all',
      'bare.tsx: duration-300',
      'loops.tsx: animate-spin',
      'loops.tsx: sm:animate-[wiggle_1s]',
      'headless.tsx: data-enter:duration-1000',
      'prose.tsx: transition',
    ])
  })

  it('finds_a_css_declaration_outside_the_opt_in_to_motion', () => {
    const found = ungatedMotionDeclarationsIn({
      'gated.css':
        '@keyframes spin { to { rotate: 1turn } } @media (prefers-reduced-motion: no-preference) { .a { animation: spin 1s; } .b { transition: opacity 1s; } }',
      'bare.css':
        '.a { animation: spin 1s infinite; } html { scroll-behavior: smooth; } .b { transition-duration: 1s }',
      'after.css':
        '@media (prefers-reduced-motion: no-preference) { .a { animation: spin 1s } } .c { animation-name: spin }',
    })

    expect(found).toEqual([
      'bare.css: animation:',
      'bare.css: scroll-behavior: smooth',
      'bare.css: transition-duration:',
      'after.css: animation-name:',
    ])
  })

  it('guards_every_transition_and_animation_class_of_the_interface', () => {
    // The glob reaches this folder and the layers below it: an empty one would read as nothing to guard.
    expect(Object.keys(sources)).toEqual(
      expect.arrayContaining(['./App.tsx', '../shared/ui/Button.tsx', '../features/pokemon/ui/PokemonModal.tsx']),
    )

    expect(unguardedMotionClassesIn(sources)).toEqual([])
  })

  it('animates_from_a_stylesheet_only_inside_the_opt_in_to_motion', () => {
    expect(globalStyles).toContain('@keyframes')

    expect(ungatedMotionDeclarationsIn({ 'src/app/index.css': globalStyles, 'index.html': indexHtml })).toEqual([])
  })

  it('leaves_every_scripted_scroll_to_the_one_function_that_asks_the_preference', () => {
    expect(sources[SCROLL_BEHAVIOR_OWNER]).toMatch(SMOOTH_SCROLL)

    const others = Object.entries(sources).filter(
      ([path, text]) => path !== SCROLL_BEHAVIOR_OWNER && SMOOTH_SCROLL.test(text),
    )
    expect(others.map(([path]) => path)).toEqual([])
  })
})
