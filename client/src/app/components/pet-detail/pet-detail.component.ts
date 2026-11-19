import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { TranslatorService } from '../../services/translator.service';
import { AgeFormatPipe } from '../../pipes/age-format.pipe';
import { ToastService } from '../../services/toast.service';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ja';
export type PetLoadingState = 'loading' | 'loaded' | 'not-found';

@Component({
  selector: 'app-pet-detail',
  imports: [DatePipe, RouterLink, NgOptimizedImage, FormsModule, AgeFormatPipe],
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetDetailComponent {
  readonly id = input<string>();

  readonly pet = signal<Pet | null>(null);
  readonly loadingState = signal<PetLoadingState>('loading');
  readonly selectedLanguage = signal<SupportedLanguage>('en');
  readonly translatedDescription = signal<string | null>(null);
  readonly isTranslating = signal(false);
  readonly translationProgress = signal(0);
  readonly translationError = signal<string | null>(null);

  readonly displayedDescription = computed(() => {
    const currentPet = this.pet();
    if (!currentPet) {
      return '';
    }
    return this.selectedLanguage() === 'en'
      ? currentPet.description
      : (this.translatedDescription() || currentPet.description);
  });

  private router = inject(Router);
  private petService = inject(PetService);
  private translatorService = inject(TranslatorService);
  private toastService = inject(ToastService);

  constructor() {
    effect((onCleanup) => {
      const petId = this.id();
      if (!petId) {
        this.router.navigate(['/pet/list']);
        return;
      }

      this.loadingState.set('loading');
      this.pet.set(null);
      this.selectedLanguage.set('en');
      this.translatedDescription.set(null);
      this.translationError.set(null);
      this.isTranslating.set(false);
      this.translationProgress.set(0);

      const sub = this.petService.getPetById(petId).subscribe(foundPet => {
        if (foundPet) {
          this.pet.set(foundPet);
          this.loadingState.set('loaded');
        } else {
          this.pet.set(null);
          this.loadingState.set('not-found');
        }
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  onLanguageChange(newLanguage: SupportedLanguage, pet: Pet): void {
    this.selectedLanguage.set(newLanguage);
    this.translationError.set(null);

    if (newLanguage === 'en') {
      // Show original description for English
      this.translatedDescription.set(null);
    } else {
      // Translate to the selected language
      this.translateDescription(pet, newLanguage);
    }
  }

  async translateDescription(pet: Pet, targetLanguage: string): Promise<void> {
    if (!pet.description || this.isTranslating()) {
      return;
    }

    this.isTranslating.set(true);
    this.translationProgress.set(0);
    this.translationError.set(null);

    try {
      // Check if Translator API is available
      if (!this.translatorService.isTranslatorAvailable()) {
        throw new Error('Translator API is not available in this browser.');
      }

      const sourceLanguage = 'en'; // Pet descriptions are always in English initially

      // Translate with progress monitoring
      const translated = await this.translatorService.translateText(
        pet.description,
        sourceLanguage,
        targetLanguage,
        (progress) => {
          this.translationProgress.set(progress);
        }
      );

      this.translatedDescription.set(translated);
      console.log('[Translation]', { sourceLanguage, targetLanguage, translated });
    } catch (err: any) {
      const message = err?.message || 'Failed to translate description. Please try again.';
      this.translationError.set(message);
      console.error('[Translation][error]', err);
      // Keep original description visible on error
      this.translatedDescription.set(null);
    } finally {
      this.isTranslating.set(false);
      this.translationProgress.set(0);
    }
  }

  onAdopt(pet: Pet): void {
    this.toastService.success(`Thank you for your interest in adopting ${pet.name}! Our adoption team will contact you within 24 hours to begin the process.`);
  }
}
