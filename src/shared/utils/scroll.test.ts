import { describe, expect, it, vi } from 'vitest'
import { PREFERS_REDUCED_MOTION, stubSystemPreferences } from '@/shared/test/systemPreferences'
import { isOnScrollbarOf, preferredScrollBehavior, scrollToTop } from './scroll'

/** An element laid out at (left, top) with a border box and, inside it, the smaller box it shows. */
function laidOut(box: { left: number; top: number; width: number; height: number }, shown: [number, number]) {
  const element = document.createElement('div')
  element.getBoundingClientRect = () =>
    ({ ...box, right: box.left + box.width, bottom: box.top + box.height }) as DOMRect
  Object.defineProperties(element, {
    clientLeft: { value: 0 },
    clientTop: { value: 0 },
    clientWidth: { value: shown[0] },
    clientHeight: { value: shown[1] },
  })
  return element
}

describe('preferredScrollBehavior', () => {
  it('is_smooth_until_the_reader_asks_the_system_for_less_motion', () => {
    const system = stubSystemPreferences()
    expect(preferredScrollBehavior()).toBe('smooth')

    system.set(PREFERS_REDUCED_MOTION, true)
    expect(preferredScrollBehavior()).toBe('auto')
  })
})

describe('scrollToTop', () => {
  it('jumps_to_the_top_without_animating_for_a_reader_who_asked_for_less_motion', () => {
    stubSystemPreferences([PREFERS_REDUCED_MOTION])
    const screen = document.createElement('div')
    screen.scrollTo = vi.fn()

    scrollToTop(screen)

    expect(screen.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('glides_to_the_top_for_everyone_else', () => {
    stubSystemPreferences()
    const screen = document.createElement('div')
    screen.scrollTo = vi.fn()

    scrollToTop(screen)

    expect(screen.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('still_reaches_the_top_where_scrollTo_takes_no_options', () => {
    stubSystemPreferences()
    const screen = document.createElement('div')
    screen.scrollTo = () => {
      throw new TypeError('scrollTo options are not supported')
    }
    screen.scrollTop = 300

    scrollToTop(screen)

    expect(screen.scrollTop).toBe(0)
  })

  it('does_nothing_without_an_element', () => {
    expect(() => scrollToTop(null)).not.toThrow()
  })
})

describe('isOnScrollbarOf', () => {
  it.each([
    ['on what the element shows', 100, 100, false],
    ['on its vertical scrollbar', 630, 100, true],
    ['on the last pixel before the scrollbar', 624, 100, false],
    ['outside the element', 700, 100, false],
  ])('says_whether_a_point_%s_is_on_the_scrollbar', (_where, x, y, expected) => {
    const scroller = laidOut({ left: 0, top: 0, width: 640, height: 400 }, [625, 400])

    expect(isOnScrollbarOf(scroller, x, y)).toBe(expected)
  })

  it('counts_from_where_the_element_is_and_not_from_the_corner_of_the_window', () => {
    const scroller = laidOut({ left: 200, top: 50, width: 300, height: 200 }, [285, 200])

    expect(isOnScrollbarOf(scroller, 490, 100)).toBe(true)
    expect(isOnScrollbarOf(scroller, 300, 100)).toBe(false)
  })

  it('finds_no_scrollbar_in_an_element_that_has_none', () => {
    const plain = laidOut({ left: 0, top: 0, width: 640, height: 400 }, [640, 400])

    expect(isOnScrollbarOf(plain, 639, 399)).toBe(false)
  })
})
