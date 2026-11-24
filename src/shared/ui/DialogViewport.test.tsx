import { createElement } from 'react'
import { Dialog } from '@headlessui/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DialogViewport } from './DialogViewport'

function renderDialog() {
  const onClose = vi.fn()
  const onDismiss = vi.fn()
  render(
    createElement(
      Dialog,
      { open: true, onClose },
      createElement(DialogViewport, { onDismiss, children: createElement('button', { type: 'button' }, 'Inside') }),
    ),
  )
  const viewport = screen.getByRole('dialog').querySelector('.dialog-viewport') as HTMLElement
  return { onClose, onDismiss, viewport, inside: screen.getByRole('button', { name: 'Inside' }) }
}

describe('DialogViewport', () => {
  it('dismisses_on_a_press_and_release_on_the_backdrop_it_lets_through', () => {
    const { onDismiss, viewport } = renderDialog()

    fireEvent.pointerDown(viewport)
    fireEvent.click(viewport)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does_not_dismiss_on_a_click_inside_what_it_holds', () => {
    const { onDismiss, inside } = renderDialog()

    fireEvent.pointerDown(inside)
    fireEvent.click(inside)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does_not_dismiss_when_a_press_that_began_inside_is_released_over_the_backdrop', () => {
    const { onDismiss, viewport, inside } = renderDialog()

    fireEvent.pointerDown(inside)
    fireEvent.click(viewport)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does_not_dismiss_on_a_press_on_its_scrollbar', () => {
    const { onDismiss, viewport } = renderDialog()
    viewport.getBoundingClientRect = () => ({ left: 0, top: 0, right: 640, bottom: 400 }) as DOMRect
    Object.defineProperties(viewport, { clientWidth: { value: 625 }, clientHeight: { value: 400 } })

    fireEvent.pointerDown(viewport, { clientX: 632, clientY: 40 })
    fireEvent.click(viewport, { clientX: 632, clientY: 40 })

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('is_the_panel_of_the_dialog_so_a_press_on_its_scrollbar_is_not_a_click_outside', () => {
    const { onClose, viewport } = renderDialog()

    fireEvent.pointerDown(viewport)
    fireEvent.pointerUp(viewport)
    fireEvent.mouseDown(viewport)
    fireEvent.click(viewport)

    expect(viewport.id).toMatch(/^headlessui-dialog-panel/)
    expect(onClose).not.toHaveBeenCalled()
  })
})
