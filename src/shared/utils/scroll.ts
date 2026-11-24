/**
 * How a scroll the page starts on its own should move: smoothly, unless the reader asked the system
 * for less motion; then it is the jump a browser makes by default
 * (#reduced-motion-covers-only-part-of-the-animations).
 */
export function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/** Scrolls a scrollable element to the top with safe fallback. */
export function scrollToTop(el: Element | null): void {
  if (!el) return
  try {
    el.scrollTo({ top: 0, behavior: preferredScrollBehavior() })
  } catch {
    // Fallback for environments without scrollTo options support
    el.scrollTop = 0
  }
}

/** Whether a point of an element's box is outside what the element shows: on its scrollbar or its border. */
export function isOnScrollbarOf(element: HTMLElement, clientX: number, clientY: number): boolean {
  const box = element.getBoundingClientRect()
  const insideBox = clientX >= box.left && clientX < box.right && clientY >= box.top && clientY < box.bottom
  const x = clientX - box.left - element.clientLeft
  const y = clientY - box.top - element.clientTop
  const insideContent = x >= 0 && x < element.clientWidth && y >= 0 && y < element.clientHeight
  return insideBox && !insideContent
}
