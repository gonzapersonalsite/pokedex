import { QueryProvider, ThemeProvider } from './providers'
import { ErrorBoundary } from './ErrorBoundary'
import { PokedexPage } from '@/pages/pokedex'
import { ToastViewport } from '@/shared/ui'

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <PokedexPage />
          <ToastViewport />
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
