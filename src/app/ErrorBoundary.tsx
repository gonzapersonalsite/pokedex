import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/shared/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md">{this.state.error.message}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })} variant="primary">
            Retry
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
