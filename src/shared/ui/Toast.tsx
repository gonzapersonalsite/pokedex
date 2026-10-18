import { useEffect } from 'react'
import { cn, useToastStore, type ToastItem } from '@/shared/utils'

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const color =
    item.variant === 'success' ? 'border-green-500' : item.variant === 'error' ? 'border-red-500' : 'border-blue-500'
  return (
    <div
      role="status"
      className={cn(
        'w-80 max-w-full rounded-xl shadow-lg border-l-4 p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
        color,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-1 w-2 h-2 rounded-full',
            item.variant === 'success' ? 'bg-green-500' : item.variant === 'error' ? 'bg-red-500' : 'bg-blue-500',
          )}
        />
        <div className="flex-1 min-w-0">
          {item.title ? <p className="font-semibold text-sm mb-0.5">{item.title}</p> : null}
          <p className="text-sm leading-snug">{item.message}</p>
        </div>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore()

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), t.duration ?? 3000))
    return () => {
      timers.forEach((id) => clearTimeout(id))
    }
  }, [toasts, dismiss])

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  )
}
