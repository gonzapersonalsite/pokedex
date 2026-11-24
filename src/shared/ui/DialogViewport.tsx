import { useRef, type ReactNode } from 'react'
import { DialogPanel } from '@headlessui/react'
import { isOnScrollbarOf } from '@/shared/utils'

/**
 * The window of a dialog: it centres what it holds and scrolls it when the window is too short
 * (#pokemon-details-dialog-overflows-short-windows). It is the panel of the Headless UI dialog, so nothing
 * in it is a click outside: its scrollbar would be one, and dragging it would close the dialog. The backdrop
 * shows through it, and a press and release on that bare part is what dismisses.
 */
export function DialogViewport({ onDismiss, children }: { onDismiss: () => void; children: ReactNode }) {
  // A press that began on the content and ended on the backdrop, or on the scrollbar, dismisses nothing.
  const pressedOnBackdrop = useRef(false)

  return (
    <DialogPanel
      className="dialog-viewport"
      onPointerDown={(event) => {
        pressedOnBackdrop.current =
          event.target === event.currentTarget && !isOnScrollbarOf(event.currentTarget, event.clientX, event.clientY)
      }}
      onClick={(event) => {
        const dismisses = pressedOnBackdrop.current && event.target === event.currentTarget
        pressedOnBackdrop.current = false
        if (dismisses) onDismiss()
      }}
    >
      {children}
    </DialogPanel>
  )
}
