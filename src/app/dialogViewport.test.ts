import { describe, expect, it } from 'vitest'
import globalStyles from './index.css?raw'

// jsdom lays nothing out, so what this holds is the rule itself: the box every dialog sits in scrolls
// (#pokemon-details-dialog-overflows-short-windows). That each dialog uses it is in the test of each one.

/** The declarations of the first rule with exactly that selector, as property -> value. */
function declarationsOf(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rule = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, 'm').exec(css.replace(/\/\*[\s\S]*?\*\//g, ''))
  if (!rule) return {}
  return Object.fromEntries(
    rule[1]
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

describe('the dialog viewport', () => {
  it('scrolls_a_dialog_taller_than_the_window_instead_of_centring_it_out_of_reach', () => {
    const viewport = declarationsOf(globalStyles, '.dialog-viewport')

    expect(viewport).toMatchObject({ position: 'fixed', inset: '0', display: 'flex', overflow: 'hidden auto' })
    // Centring belongs to the panel's auto margins: align-items would push a tall panel above the top.
    expect(viewport).not.toHaveProperty('align-items')
  })

  it('shows_no_scrollbar_for_a_panel_that_only_overflows_while_it_moves_in_or_out', () => {
    expect(declarationsOf(globalStyles, '.dialog-viewport:has([data-transition])')).toEqual({ overflow: 'hidden' })
  })
})
