import { Injectable } from '@angular/core';

export type TranslatorAvailability = 'available' | 'downloadable' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class TranslatorService {
  private translatorCache = new Map<string, any>();

  isTranslatorAvailable(): boolean {
    return typeof (globalThis as any).Translator !== 'undefined';
  }

  async checkAvailability(
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslatorAvailability> {
    if (!this.isTranslatorAvailable()) {
      return 'unavailable';
    }

    try {
      const Translator: any = (globalThis as any).Translator;
      const availability = await Translator.availability({
        sourceLanguage,
        targetLanguage,
      });
      return availability ?? 'unavailable';
    } catch {
      return 'unavailable';
    }
  }

  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.isTranslatorAvailable()) {
      throw new Error('Translator API is not available in this browser.');
    }

    if (!text || text.trim().length === 0) {
      return text;
    }

    const Translator: any = (globalThis as any).Translator;

    // Check availability first
    const availability = await this.checkAvailability(sourceLanguage, targetLanguage);
    if (availability === 'unavailable') {
      throw new Error(
        `Translation from ${sourceLanguage} to ${targetLanguage} is not available.`
      );
    }

    // Check cache for existing translator instance
    const cacheKey = `${sourceLanguage}-${targetLanguage}`;
    let translator = this.translatorCache.get(cacheKey);

    if (!translator) {
      // Create translator with progress monitoring if downloadable
      if (availability === 'downloadable' && onProgress) {
        translator = await Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor(m: any) {
            m.addEventListener('downloadprogress', (e: any) => {
              const progress = e.loaded * 100;
              onProgress(progress);
            });
          },
        });
      } else {
        translator = await Translator.create({
          sourceLanguage,
          targetLanguage,
        });
      }

      // Cache the translator instance
      this.translatorCache.set(cacheKey, translator);
    }

    // Translate the text
    const translated = await translator.translate(text.trim());
    return String(translated);
  }
}

