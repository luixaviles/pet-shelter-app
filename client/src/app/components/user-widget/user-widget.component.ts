import { Component, ChangeDetectionStrategy, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-widget',
  imports: [CommonModule],
  templateUrl: './user-widget.component.html',
  styleUrls: ['./user-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserWidgetComponent {
  private userService = inject(UserService);
  private elementRef = inject(ElementRef);
  currentUser = this.userService.currentUser;
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMobileMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMobileMenu();
    }
  }
}

