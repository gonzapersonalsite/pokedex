import { create } from 'zustand';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  enqueue: (t: Omit<ToastItem, 'id'> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  enqueue: (t) => {
    const id =
      t.id ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ToastItem = {
      id,
      title: t.title,
      message: t.message,
      variant: t.variant ?? 'info',
      duration: t.duration ?? 3000,
    };
    set((s) => ({ toasts: [item, ...s.toasts].slice(0, 5) }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function toast(input: Omit<ToastItem, 'id'> & { id?: string }) {
  return useToastStore.getState().enqueue(input);
}
