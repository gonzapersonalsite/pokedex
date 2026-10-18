import { useCallback, useSyncExternalStore } from 'react'

export function isScrolledPast(scrollY: number, thresholdPx: number): boolean {
  return scrollY > thresholdPx
}

function subscribeToWindowScroll(onScroll: () => void): () => void {
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}

/** Whether the window has scrolled further than `thresholdPx`; re-renders only when that answer flips. */
export function useScrolledPast(thresholdPx: number): boolean {
  const readSnapshot = useCallback(() => isScrolledPast(window.scrollY, thresholdPx), [thresholdPx])
  return useSyncExternalStore(subscribeToWindowScroll, readSnapshot)
}
