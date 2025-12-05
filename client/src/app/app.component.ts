import { Component, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { PetService } from './services/pet.service';
import { UserWidgetComponent } from './components/user-widget/user-widget.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { GithubRibbonComponent } from './components/github-ribbon/github-ribbon.component';
import { filter, map, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, UserWidgetComponent, ToastContainerComponent, GithubRibbonComponent],
  template: `
    <div class="min-h-screen">
      <!-- <app-github-ribbon></app-github-ribbon> -->
      @if (isPetRoute$ | async) {
        <nav class="bg-white shadow-md sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div class="flex justify-between items-center h-16 sm:h-20">
              <a routerLink="/" class="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-shrink">
                <span class="text-2xl sm:text-4xl flex-shrink-0">🐾</span>
                <div class="min-w-0">
                  <h1 class="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 truncate">Pet Shelter App</h1>
                  <p class="text-xs sm:text-xs md:text-sm text-gray-600">Find your perfect companion</p>
                </div>
              </a>

              <div class="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
                <app-user-widget></app-user-widget>
                <a
                  routerLink="/pet/add"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md animate-scale-in text-xs sm:text-sm md:text-base whitespace-nowrap"
                >
                  <span class="hidden sm:inline">+ </span>Add<span class="hidden md:inline"> New</span> Pet
                </a>
                <a
                  href="https://github.com/luixaviles/pet-shelter-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-600 hover:text-primary-700 p-1.5 sm:p-2 rounded-md transition-colors cursor-pointer flex items-center flex-shrink-0"
                  title="View on GitHub"
                >
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </nav>
      }

      <main>
        <router-outlet></router-outlet>
      </main>

      @if (isPetRoute$ | async) {
        <footer class="bg-gray-800 text-white py-8 mt-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-lg mb-2">🐾 Pet Shelter App - Bringing Families Together</p>
            <p class="text-gray-400 text-sm">
              Every pet deserves a loving home. Adopt, don't shop!
            </p>
          </div>
        </footer>
      }

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  public petService = inject(PetService);
  
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Observable that emits true when the current route starts with '/pet'
  // Uses NavigationEnd events and startWith to emit immediately with current route state
  isPetRoute$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.router.url.startsWith('/pet')),
    startWith(this.router.url.startsWith('/pet')),
    takeUntil(this.destroy$)
  );

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
