// jsdom never scrolls: tests move window.scrollY themselves.

/** Moves the window without telling anyone, for resetting between tests. */
export function setWindowScrollY(y: number): void {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
}

/** Moves the window and fires `scroll`, as a real scroll would. */
export function scrollWindowTo(y: number): void {
  setWindowScrollY(y)
  window.dispatchEvent(new Event('scroll'))
}
