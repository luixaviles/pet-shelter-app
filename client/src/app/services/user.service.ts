import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Default admin user based in San Francisco, CA
  readonly currentUser = signal<User>({
    name: 'Admin',
    location: 'San Francisco, CA'
  });
}

