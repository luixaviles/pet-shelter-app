import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { PetService } from './services/pet.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen">
      <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <a routerLink="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span class="text-4xl">🐾</span>
              <div>
                <h1 class="text-2xl font-bold text-gray-800">Pet Shelter</h1>
                <p class="text-sm text-gray-600">Find your perfect companion</p>
              </div>
            </a>

            <div class="flex items-center gap-4">
              <label class="flex items-center cursor-pointer group">
                <span class="mr-3 text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                  Admin Mode
                </span>
                <div class="relative">
                  <input
                    type="checkbox"
                    [checked]="petService.isAdminMode()"
                    (change)="petService.toggleAdminMode()"
                    class="sr-only peer"
                  />
                  <div class="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
              </label>

              @if (petService.isAdminMode()) {
                <a
                  routerLink="/add-pet"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md animate-scale-in"
                >
                  + Add New Pet
                </a>
              }
            </div>
          </div>
        </div>
      </nav>

      <main>
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-lg mb-2">🐾 Pet Shelter - Bringing Families Together</p>
          <p class="text-gray-400 text-sm">
            Every pet deserves a loving home. Adopt, don't shop!
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  public petService = inject(PetService);
}
