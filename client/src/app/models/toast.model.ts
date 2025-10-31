export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
}
