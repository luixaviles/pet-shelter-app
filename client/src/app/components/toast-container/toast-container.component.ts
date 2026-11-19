import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../toast/toast.component';

interface DocumentWithAriaNotify extends Document {
  ariaNotify?: (message: string, options?: { priority?: 'normal' | 'high' }) => void;
}

@Component({
  selector: 'app-toast-container',
  imports: [ToastComponent],
  template: `
    @if (!supportsAriaNotify) {
      <p class="visually-hidden">Screen reader announcements</p>
      <div class="visually-hidden" aria-live="polite" aria-atomic="true">
        {{ politeAnnouncement() }}
      </div>
      <div class="visually-hidden" aria-live="assertive" aria-atomic="true">
        {{ assertiveAnnouncement() }}
      </div>
    }

    <div
      #toastPopover
      popover="manual"
      role="region"
      aria-label="Notifications"
      class="toast-popover"
      [class.toast-popover--fallback-open]="!supportsPopover && toasts().length > 0"
      [hidden]="!supportsPopover && toasts().length === 0"
    >
      @for (toast of toasts(); track toast.id) {
        <div class="pointer-events-auto">
          <app-toast [toast]="toast" (dismissed)="onToastDismissed($event)" />
        </div>
      }
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  private document = inject(DOCUMENT) as DocumentWithAriaNotify;
  private toastPopover = viewChild<ElementRef<HTMLElement>>('toastPopover');

  toasts = this.toastService.toasts.asReadonly();
  politeAnnouncement = signal<string>('');
  assertiveAnnouncement = signal<string>('');

  readonly supportsPopover =
    typeof HTMLElement !== 'undefined' && Object.hasOwn(HTMLElement.prototype, 'popover');
  readonly supportsAriaNotify = typeof this.document.ariaNotify === 'function';

  private seenToastIds = new Set<string>();
  private previousFocusEl: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const currentToasts = this.toasts();
      const el = this.toastPopover()?.nativeElement;

      if (currentToasts.length > 0 && this.seenToastIds.size === 0) {
        const active = this.document.activeElement as HTMLElement | null;
        if (active && (!el || !el.contains(active))) {
          this.previousFocusEl = active;
        }
      }

      for (const toast of currentToasts) {
        if (!this.seenToastIds.has(toast.id)) {
          this.announceToast(toast.message, toast.severity === 'error' || toast.severity === 'warn');
        }
      }
      this.seenToastIds = new Set(currentToasts.map(t => t.id));

      if (!el) {
        return;
      }

      const hasPopoverApi =
        typeof el.showPopover === 'function' && typeof el.hidePopover === 'function';
      if (!hasPopoverApi) {
        return;
      }

      if (currentToasts.length > 0) {
        try {
          if (!this.isPopoverOpen(el)) {
            el.showPopover();
          }
        } catch {
          // Ignore InvalidStateError if already open or detached
        }
      } else {
        try {
          if (this.isPopoverOpen(el)) {
            el.hidePopover();
          }
        } catch {
          // Ignore InvalidStateError if already closed or detached
        }
      }
    });
  }

  onToastDismissed(id: string): void {
    const el = this.toastPopover()?.nativeElement;
    const active = this.document.activeElement as HTMLElement | null;
    const focusInsideToasts = Boolean(el && active && el.contains(active));

    this.toastService.remove(id);

    if (focusInsideToasts) {
      queueMicrotask(() => {
        const remainingCloseBtn = el?.querySelector<HTMLButtonElement>('button[aria-label="Close notification"]');
        if (remainingCloseBtn) {
          remainingCloseBtn.focus();
        } else if (this.previousFocusEl?.isConnected) {
          this.previousFocusEl.focus();
          this.previousFocusEl = null;
        }
      });
    }
  }

  private isPopoverOpen(el: HTMLElement): boolean {
    try {
      return el.matches(':popover-open') || el.classList.contains(':popover-open');
    } catch {
      return el.classList.contains(':popover-open');
    }
  }

  private announceToast(message: string, isHighPriority: boolean): void {
    if (this.supportsAriaNotify) {
      this.document.ariaNotify?.(message, { priority: isHighPriority ? 'high' : 'normal' });
    } else if (isHighPriority) {
      this.assertiveAnnouncement.set('');
      queueMicrotask(() => this.assertiveAnnouncement.set(message));
    } else {
      this.politeAnnouncement.set('');
      queueMicrotask(() => this.politeAnnouncement.set(message));
    }
  }
}
