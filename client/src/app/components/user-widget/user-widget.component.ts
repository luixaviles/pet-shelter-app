import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
  currentUser = this.userService.currentUser;
}

