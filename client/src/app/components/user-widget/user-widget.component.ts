import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { UserService } from '../../services/user.service';

let nextPopoverId = 0;

@Component({
  selector: 'app-user-widget',
  imports: [],
  templateUrl: './user-widget.component.html',
  styleUrls: ['./user-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserWidgetComponent {
  private userService = inject(UserService);
  currentUser = this.userService.currentUser;
  popoverId = `user-menu-popover-${++nextPopoverId}`;
  isMobileMenuOpen = signal<boolean>(false);

  onPopoverToggle(event: Event): void {
    const toggleEvent = event as Event & { newState?: string };
    this.isMobileMenuOpen.set(toggleEvent.newState === 'open');
  }
}
