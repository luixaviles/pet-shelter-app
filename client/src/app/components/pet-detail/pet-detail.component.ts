import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { TranslatorService } from '../../services/translator.service';
import { AgeFormatPipe } from '../../pipes/age-format.pipe';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pet-detail',
  imports: [CommonModule, RouterLink, NgOptimizedImage, FormsModule, AgeFormatPipe],
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetDetailComponent implements OnInit {
  pet$!: Observable<Pet | undefined>;
  selectedLanguage: 'en' | 'es' | 'fr' | 'ja' = 'en';
  translatedDescription: string | null = null;
  isTranslating: boolean = false;
  translationProgress: number = 0;
  translationError: string | null = null;
  originalDescription: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);
  private translatorService = inject(TranslatorService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.pet$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/pet/list']);
          return [];
        }
        return this.petService.getPetById(id);
      }),
      tap(pet => {
        if (pet?.description) {
          this.originalDescription = pet.description;
          this.cdr.markForCheck();
        }
      })
    );
  }

  onLanguageChange(newLanguage: 'en' | 'es' | 'fr', pet: Pet): void {
    this.selectedLanguage = newLanguage;
    this.translationError = null;
    
    if (newLanguage === 'en') {
      // Show original description for English
      this.translatedDescription = null;
      this.cdr.markForCheck();
    } else {
      // Translate to the selected language
      this.translateDescription(pet, newLanguage);
    }
  }

  async translateDescription(pet: Pet, targetLanguage: string): Promise<void> {
    if (!pet.description || this.isTranslating) {
      return;
    }

    this.isTranslating = true;
    this.translationProgress = 0;
    this.translationError = null;
    this.cdr.markForCheck();

    try {
      // Check if Translator API is available
      if (!this.translatorService.isTranslatorAvailable()) {
        throw new Error('Translator API is not available in this browser.');
      }

      const sourceLanguage = 'en'; // Pet descriptions are always in English initially

      // Translate with progress monitoring
      const translated = await this.translatorService.translateText(
        this.originalDescription || pet.description,
        sourceLanguage,
        targetLanguage,
        (progress) => {
          this.translationProgress = progress;
          this.cdr.markForCheck();
        }
      );

      this.translatedDescription = translated;
      console.log('[Translation]', { sourceLanguage, targetLanguage, translated });
    } catch (err: any) {
      const message = err?.message || 'Failed to translate description. Please try again.';
      this.translationError = message;
      console.error('[Translation][error]', err);
      // Keep original description visible on error
      this.translatedDescription = null;
    } finally {
      this.isTranslating = false;
      this.translationProgress = 0;
      this.cdr.markForCheck();
    }
  }

  onAdopt(pet: Pet): void {
    this.toastService.success(`Thank you for your interest in adopting ${pet.name}! Our adoption team will contact you within 24 hours to begin the process.`);
  }
}
