import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/ui'

const PORTFOLIO_URL = 'https://mi-portafolio-gonzalo.vercel.app/'
const GITHUB_URL = 'https://github.com/gonzapersonalsite'
const EMAIL = 'gonzalomartinezg2001@gmail.com'
const POKEAPI_URL = 'https://pokeapi.co/'

const LINK_CLASS =
  'font-semibold text-white underline decoration-red-400/60 underline-offset-4 hover:decoration-red-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

export function CreditsButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="fixed bottom-[max(1.25rem,var(--safe-bottom))] left-[max(1.25rem,var(--safe-left))] z-30 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 px-3.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition motion-reduce:transition-none hover:bg-primary-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 print:hidden"
    >
      <InformationCircleIcon className="h-5 w-5" aria-hidden />
      <span>Credits</span>
    </button>
  )
}

export function CreditsContent() {
  const year = new Date().getFullYear()

  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-300">
      <p>
        A fan-made Pokédex by <span className="font-semibold text-white">Gonzalo Martínez García</span>, Full Stack
        Developer.
      </p>
      <p>
        Data and sprites from{' '}
        <a className={LINK_CLASS} href={POKEAPI_URL} {...EXTERNAL_LINK_PROPS}>
          PokéAPI
        </a>
        .
      </p>
      <p className="text-xs leading-relaxed text-slate-400">
        Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and Creatures. This is an unofficial
        fan project, not affiliated with or endorsed by The Pokémon Company.
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <a className={LINK_CLASS} href={PORTFOLIO_URL} {...EXTERNAL_LINK_PROPS}>
          Portfolio
        </a>
        <a className={LINK_CLASS} href={GITHUB_URL} {...EXTERNAL_LINK_PROPS}>
          GitHub
        </a>
        <a className={LINK_CLASS} href={`mailto:${EMAIL}`}>
          Email
        </a>
      </div>
      <p className="border-t border-white/10 pt-4 font-mono text-xs text-slate-500">© {year} Gonzalo Martínez García</p>
    </div>
  )
}

export function CreditsFooter() {
  return (
    <footer aria-labelledby="credits-title" className="mt-8 border-t-4 border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">Pokédex · System info</p>
        <h2 id="credits-title" className="mt-1 text-xl font-bold text-white">
          Credits &amp; legal
        </h2>
        <div className="mt-4 max-w-3xl">
          <CreditsContent />
        </div>
      </div>
    </footer>
  )
}

export function CreditsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4 safe-inset">
        <DialogPanel className="relative w-full max-w-lg overflow-hidden rounded-2xl border-4 border-slate-700 bg-slate-900 text-slate-200 shadow-2xl">
          <div className="border-b-4 border-red-600 bg-slate-950 px-5 py-4">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">Pokédex · System info</p>
            <DialogTitle as="h2" className="mt-1 text-xl font-bold text-white">
              Credits &amp; legal
            </DialogTitle>
          </div>
          <div className="max-h-[65svh] overflow-y-auto overscroll-contain p-5">
            <CreditsContent />
          </div>
          <div className="flex justify-end border-t border-white/10 bg-slate-950/60 px-5 py-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
