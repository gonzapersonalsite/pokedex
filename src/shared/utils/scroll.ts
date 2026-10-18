/** Scrolls a scrollable element to the top with safe fallback. */
export function scrollToTop(el: Element | null, behavior: ScrollBehavior = 'smooth'): void {
  if (!el) return
  try {
    ;(el as HTMLElement).scrollTo({ top: 0, behavior })
  } catch {
    // Fallback for environments without scrollTo options support
    ;(el as HTMLElement).scrollTop = 0
  }
}
