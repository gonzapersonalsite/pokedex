import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScreenScan } from './useScreenScan'

interface Screen {
  open: boolean
  shown: number | string | null
}

const renderScan = (initialProps: Screen) =>
  renderHook(({ open, shown }: Screen) => useScreenScan(open, shown), { initialProps })

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useScreenScan', () => {
  it('does_scan_once_when_the_modal_opens_and_then_stays_still', () => {
    const { result } = renderScan({ open: true, shown: 25 })
    expect(result.current).toMatchObject({ length: 1400 })

    act(() => vi.advanceTimersByTime(1399))
    expect(result.current).not.toBeNull()
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBeNull()

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does_scan_again_with_a_new_run_when_the_modal_moves_to_another_pokemon', () => {
    const { result, rerender } = renderScan({ open: true, shown: 25 })
    const opening = result.current?.run
    act(() => vi.advanceTimersByTime(1400))

    rerender({ open: true, shown: 26 })
    expect(result.current).toMatchObject({ length: 1600 })
    expect(result.current?.run).not.toBe(opening)

    act(() => vi.advanceTimersByTime(1600))
    expect(result.current).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does_restart_the_run_when_the_pokemon_changes_while_the_screen_still_scans', () => {
    const { result, rerender } = renderScan({ open: true, shown: 25 })
    const opening = result.current?.run
    act(() => vi.advanceTimersByTime(500))

    rerender({ open: true, shown: 26 })
    expect(result.current?.run).not.toBe(opening)
    act(() => vi.advanceTimersByTime(1599))
    expect(result.current).not.toBeNull()
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBeNull()
  })

  it('does_stop_when_the_modal_closes_and_scans_the_opening_again_when_it_reopens', () => {
    const { result, rerender } = renderScan({ open: true, shown: 25 })

    rerender({ open: false, shown: 25 })
    expect(result.current).toBeNull()
    expect(vi.getTimerCount()).toBe(0)

    rerender({ open: true, shown: 25 })
    expect(result.current).toMatchObject({ length: 1400 })
  })

  it('does_not_scan_while_the_modal_is_closed', () => {
    const { result } = renderScan({ open: false, shown: null })

    expect(result.current).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })
})
