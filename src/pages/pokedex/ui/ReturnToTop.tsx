import { ArrowUpIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils'
import { useScrolledPast } from '../model/useScrolledPast'

const SHOW_AFTER_SCROLL_PX = 400

export function ReturnToTop() {
  const scrolledDown = useScrolledPast(SHOW_AFTER_SCROLL_PX)

  return (
    // #root starts at the top of the document; the sticky header travels with the viewport,
    // so jumping to it would not move the page. A link, not a button: it works without JS.
    <a
      href="#root"
      aria-label="Back to top"
      className={cn(
        'fixed bottom-[max(1.25rem,var(--safe-bottom))] right-[max(1.25rem,var(--safe-right))] z-30',
        'flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/60 text-white shadow-lg',
        'transition motion-reduce:transition-none hover:scale-110 hover:bg-primary-500',
        'focus-visible:scale-110 focus-visible:bg-primary-500 focus-visible:outline-hidden',
        'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500',
        'print:hidden',
        // Hidden only to the eye and the pointer: keyboard users can still reach it at any time.
        scrolledDown
          ? 'opacity-100'
          : 'pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100',
      )}
    >
      <ArrowUpIcon className="h-5 w-5" aria-hidden />
    </a>
  )
}
