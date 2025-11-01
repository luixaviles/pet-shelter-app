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
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
              <a routerLink="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <span class="text-4xl">🐾</span>
                <div>
                  <h1 class="text-2xl font-bold text-gray-800">Pet Shelter App</h1>
                  <p class="text-sm text-gray-600">Find your perfect companion</p>
                </div>
              </a>

              <div class="flex items-center gap-4">
                <app-user-widget></app-user-widget>
                <a
                  routerLink="/pet/add"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md animate-scale-in"
                >
                  + Add New Pet
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
