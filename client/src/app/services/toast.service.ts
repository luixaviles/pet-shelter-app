import { Injectable, signal } from '@angular/core';
import { Toast, ToastSeverity } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly DEFAULT_DURATION = 5000;
  private readonly ERROR_DURATION = 7000;
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  toasts = signal<Toast[]>([]);

  show(message: string, severity: ToastSeverity, duration?: number): void {
    const id = this.generateId();
    const toast: Toast = {
      id,
      message,
      severity,
      duration: duration ?? (severity === 'error' ? this.ERROR_DURATION : this.DEFAULT_DURATION)
    };

    this.toasts.update(toasts => [...toasts, toast]);
    this.scheduleAutoDismiss(toast);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warn(message: string, duration?: number): void {
    this.show(message, 'warn', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  remove(id: string): void {
    this.clearTimeout(id);
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.toasts.set([]);
  }

  private scheduleAutoDismiss(toast: Toast): void {
    if (toast.duration && toast.duration > 0) {
      const timeout = setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);

      this.timeouts.set(toast.id, timeout);
    }
  }

  private clearTimeout(id: string): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
