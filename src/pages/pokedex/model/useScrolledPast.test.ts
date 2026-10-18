import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollWindowTo, setWindowScrollY } from '@/shared/test/scrollWindow'
import { isScrolledPast, useScrolledPast } from './useScrolledPast'

afterEach(() => {
  vi.restoreAllMocks()
  setWindowScrollY(0)
})

describe('isScrolledPast', () => {
  it('is_false_up_to_the_threshold_and_true_beyond_it', () => {
    expect(isScrolledPast(0, 400)).toBe(false)
    expect(isScrolledPast(400, 400)).toBe(false)
    expect(isScrolledPast(401, 400)).toBe(true)
  })
})

describe('useScrolledPast', () => {
  it('follows_the_window_scroll_down_and_back_up', () => {
    const { result } = renderHook(() => useScrolledPast(400))
    expect(result.current).toBe(false)

    act(() => scrollWindowTo(1200))
    expect(result.current).toBe(true)

    act(() => scrollWindowTo(100))
    expect(result.current).toBe(false)
  })

  it('removes_the_same_scroll_listener_it_added_once_unmounted', () => {
    const added = vi.spyOn(window, 'addEventListener')
    const removed = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrolledPast(400))
    const scrollHandler = added.mock.calls.find(([type]) => type === 'scroll')?.[1]
    expect(scrollHandler).toBeTypeOf('function')

    unmount()
    expect(removed).toHaveBeenCalledWith('scroll', scrollHandler)
  })
})
