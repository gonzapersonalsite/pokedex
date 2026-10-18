import { createElement } from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { scrollWindowTo, setWindowScrollY } from '@/shared/test/scrollWindow'
import { ReturnToTop } from './ReturnToTop'

afterEach(() => {
  setWindowScrollY(0)
})

describe('ReturnToTop', () => {
  it('links_to_the_top_of_the_document_with_an_accessible_name', () => {
    render(createElement(ReturnToTop))

    expect(screen.getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#root')
  })

  it('stays_out_of_sight_at_the_top_and_shows_once_the_list_is_scrolled_down', () => {
    render(createElement(ReturnToTop))
    const link = screen.getByRole('link', { name: 'Back to top' })
    expect(link).toHaveClass('opacity-0', 'pointer-events-none')

    act(() => scrollWindowTo(2000))
    expect(link).toHaveClass('opacity-100')
    expect(link).not.toHaveClass('opacity-0', 'pointer-events-none')
  })
})
