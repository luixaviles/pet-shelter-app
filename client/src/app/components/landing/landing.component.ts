import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

type TabType = 'prompt' | 'writer' | 'proofreader' | 'translator';
type LangType = 'en' | 'es' | 'fr';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  activeTab = signal<TabType>('prompt');
  activeLang = signal<LangType>('en');
  isMobileMenuOpen = signal<boolean>(false);

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  switchLanguage(lang: LangType): void {
    this.activeLang.set(lang);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  scrollToSection(sectionId: string): void {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu after navigation
    this.closeMobileMenu();
  }
}

