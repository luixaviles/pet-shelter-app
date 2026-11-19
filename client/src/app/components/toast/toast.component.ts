import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { Toast } from '../../models/toast.model';

@Component({
  selector: 'app-toast',
  imports: [],
  template: `
    <div
      [class]="getToastClasses()"
      class="flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-full animate-slide-up motion-reduce:animate-none"
    >
      <div [class]="getIconClasses()" class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center">
        @if (severity() === 'success') {
          <svg aria-hidden="true" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        } @else if (severity() === 'info') {
          <svg aria-hidden="true" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } @else if (severity() === 'warn') {
          <svg aria-hidden="true" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        } @else if (severity() === 'error') {
          <svg aria-hidden="true" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium break-words">{{ toast().message }}</p>
      </div>
      <button
        type="button"
        class="flex-shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
        [class.focus-visible:ring-gray-500]="severity() === 'success' || severity() === 'info'"
        [class.focus-visible:ring-yellow-500]="severity() === 'warn'"
        [class.focus-visible:ring-red-500]="severity() === 'error'"
        (click)="onDismiss()"
        aria-label="Close notification"
      >
        <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  toast = input.required<Toast>();
  dismissed = output<string>();

  severity = () => this.toast().severity;

  onDismiss(): void {
    this.dismissed.emit(this.toast().id);
  }

  getToastClasses(): string {
    const severity = this.severity();
    const baseClasses = 'border';

    switch (severity) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200 text-green-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`;
      case 'warn':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-200 text-red-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-800`;
    }
  }

  getIconClasses(): string {
    const severity = this.severity();

    switch (severity) {
      case 'success':
        return 'bg-green-500';
      case 'info':
        return 'bg-blue-500';
      case 'warn':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }
}
