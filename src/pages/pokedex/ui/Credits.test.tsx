import { createElement, Fragment } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CreditsContent, CreditsDialog, CreditsFooter } from './Credits'

const PORTFOLIO_URL = 'https://mi-portafolio-gonzalo.vercel.app/'
const GITHUB_URL = 'https://github.com/gonzapersonalsite'
const EMAIL = 'gonzalomartinezg2001@gmail.com'
const POKEAPI_URL = 'https://pokeapi.co/'

// A surface or a text colour of the dark scheme written without its dark: variant: in the light
// scheme it would still paint the credits dark.
const DARK_SCHEME_ONLY = /^(?:bg-slate-(?:800|900|950)|text-(?:white|slate-(?:100|200|300)))(?:\/\d+)?$/

function coloursThatStayDarkIn(root: Element): string[] {
  return [root, ...root.querySelectorAll('*')].flatMap((element) =>
    [...element.classList].filter((className) => DARK_SCHEME_ONLY.test(className)),
  )
}

describe('Credits', () => {
  it('names the author, the data source and the trademark disclaimer', () => {
    render(createElement(CreditsContent))

    expect(screen.getByText('Gonzalo Martínez García')).toBeInTheDocument()
    expect(screen.getByText(/Full Stack Developer/)).toBeInTheDocument()
    expect(screen.getByText(/unofficial fan project/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Gonzalo Martínez García`))).toBeInTheDocument()
  })

  it('links to the portfolio, GitHub, email and PokéAPI', () => {
    render(createElement(CreditsContent))

    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', PORTFOLIO_URL)
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', GITHUB_URL)
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute('href', `mailto:${EMAIL}`)
    expect(screen.getByRole('link', { name: 'PokéAPI' })).toHaveAttribute('href', POKEAPI_URL)
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('closes with the footer landmark and its own heading', () => {
    render(createElement(CreditsFooter))

    expect(screen.getByRole('contentinfo', { name: 'Credits & legal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Credits & legal' })).toBeInTheDocument()
    expect(screen.getByText('Pokédex · System info')).toBeInTheDocument()
  })

  it('labels each footer with a heading of its own when a page holds two', () => {
    render(createElement(Fragment, null, createElement(CreditsFooter), createElement(CreditsFooter)))

    const footers = screen.getAllByRole('contentinfo', { name: 'Credits & legal' })
    const labels = footers.map((footer) => footer.getAttribute('aria-labelledby'))
    const headings = footers.map((footer) => within(footer).getByRole('heading', { level: 2 }).id)

    expect(labels).toEqual(headings)
    expect(new Set(headings).size).toBe(2)
  })

  it('follows_the_theme_in_its_footer_instead_of_staying_dark', () => {
    render(createElement(CreditsFooter))

    expect(coloursThatStayDarkIn(screen.getByRole('contentinfo'))).toEqual([])
  })

  it('follows_the_theme_in_its_dialog_instead_of_staying_dark', async () => {
    render(createElement(CreditsDialog, { open: true, onClose: vi.fn() }))

    expect(coloursThatStayDarkIn(await screen.findByRole('dialog', { name: 'Credits & legal' }))).toEqual([])
  })

  it('offers the same credits in a dialog', async () => {
    render(createElement(CreditsDialog, { open: true, onClose: vi.fn() }))

    expect(await screen.findByRole('dialog', { name: 'Credits & legal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', PORTFOLIO_URL)
  })

  it('sits_its_dialog_in_the_viewport_that_scrolls_centred_by_its_own_margins', async () => {
    render(createElement(CreditsDialog, { open: true, onClose: vi.fn() }))

    const viewport = (await screen.findByRole('dialog', { name: 'Credits & legal' })).querySelector('.dialog-viewport')
    expect(viewport?.children).toHaveLength(1)
    expect(viewport?.firstElementChild).toHaveClass('m-auto')
    expect(viewport?.firstElementChild).toContainElement(screen.getByRole('button', { name: 'Close' }))
  })

  it('closes_from_its_backdrop', async () => {
    const onClose = vi.fn()
    render(createElement(CreditsDialog, { open: true, onClose }))
    const viewport = (await screen.findByRole('dialog', { name: 'Credits & legal' })).querySelector('.dialog-viewport')

    fireEvent.pointerDown(viewport as Element)
    fireEvent.click(viewport as Element)

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
