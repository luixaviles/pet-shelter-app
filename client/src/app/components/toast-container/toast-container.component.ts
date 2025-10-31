import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
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
  
  toasts = this.toastService.toasts.asReadonly();

  onToastDismissed(id: string): void {
    this.toastService.remove(id);
  }
}
