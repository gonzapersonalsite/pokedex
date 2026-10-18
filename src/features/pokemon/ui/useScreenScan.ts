import { useEffect, useState } from 'react'

// The scan line of index.css (.animate-scan) runs for the first look when the Pokédex opens,
// and for a slightly longer one each time it moves to another Pokémon.
const OPENING_SCAN_MS = 1400
const NAVIGATION_SCAN_MS = 1600
const CLOSED = 'closed'

export interface ScreenScan {
  /** Different for each run, so an overlay keyed by it restarts its animation. */
  run: string
  length: number
}

/** The scan the screen shows now, or null: one run per opening and per Pokémon shown. */
export function useScreenScan(open: boolean, shown: number | string | null): ScreenScan | null {
  const target = open ? `open:${String(shown ?? '')}` : CLOSED
  // The last target seen is kept apart from the run: a run that ends must not read as a new target.
  const [seen, setSeen] = useState(CLOSED)
  const [scan, setScan] = useState<ScreenScan | null>(null)
  if (seen !== target) {
    setSeen(target)
    setScan(target === CLOSED ? null : { run: target, length: seen === CLOSED ? OPENING_SCAN_MS : NAVIGATION_SCAN_MS })
  }
  useEffect(() => {
    if (scan === null) return
    const timer = setTimeout(() => setScan(null), scan.length)
    return () => clearTimeout(timer)
  }, [scan])
  return scan
}
