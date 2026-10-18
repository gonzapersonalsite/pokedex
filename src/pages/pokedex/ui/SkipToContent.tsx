export function SkipToContent({ targetId }: { targetId: string }) {
  return (
    // Off-screen until it takes the focus: the first Tab reveals it, the mouse never sees it.
    <a
      href={`#${targetId}`}
      className="fixed left-2 top-2 z-40 -translate-y-[200%] rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white shadow-lg transition-transform motion-reduce:transition-none focus:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 print:hidden"
    >
      Skip to content
    </a>
  )
}
