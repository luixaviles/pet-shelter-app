import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type TabType = 'prompt' | 'writer' | 'proofreader' | 'translator';
type LangType = 'en' | 'es' | 'fr';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  activeTab = signal<TabType>('prompt');
  activeLang = signal<LangType>('en');

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  switchLanguage(lang: LangType): void {
    this.activeLang.set(lang);
  }

  scrollToSection(sectionId: string): void {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

