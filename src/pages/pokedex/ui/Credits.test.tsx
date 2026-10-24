import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CreditsContent, CreditsDialog, CreditsFooter } from './Credits'

const PORTFOLIO_URL = 'https://mi-portafolio-gonzalo.vercel.app/'
const GITHUB_URL = 'https://github.com/gonzapersonalsite'
const EMAIL = 'gonzalomartinezg2001@gmail.com'
const POKEAPI_URL = 'https://pokeapi.co/'

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

  it('offers the same credits in a dialog', async () => {
    render(createElement(CreditsDialog, { open: true, onClose: vi.fn() }))

    expect(await screen.findByRole('dialog', { name: 'Credits & legal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', PORTFOLIO_URL)
  })
})
