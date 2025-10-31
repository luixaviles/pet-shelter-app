import { Injectable } from '@angular/core';

export type ProofreaderAvailability = 'available' | 'downloadable' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class ProofreaderService {
  private proofreaderCache: any | null = null;

  isProofreaderAvailable(): boolean {
    return typeof (globalThis as any).Proofreader !== 'undefined';
  }

  async checkAvailability(): Promise<ProofreaderAvailability> {
    if (!this.isProofreaderAvailable()) {
      return 'unavailable';
    }

    try {
      const Proofreader: any = (globalThis as any).Proofreader;
      const availability = await Proofreader.availability();
      return availability ?? 'unavailable';
    } catch {
      return 'unavailable';
    }
  }

  async proofreadText(
    text: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.isProofreaderAvailable()) {
      throw new Error('Proofreader API is not available in this browser.');
    }

    if (!text || text.trim().length === 0) {
      return text;
    }

    const Proofreader: any = (globalThis as any).Proofreader;

    // Check availability first
    const availability = await this.checkAvailability();
    if (availability === 'unavailable') {
      throw new Error('Proofreader API is unavailable. Enable the Proofreader API or use a supported Chrome version.');
    }

    // Use cached proofreader instance if available
    let proofreader = this.proofreaderCache;

    if (!proofreader) {
      // Create proofreader with progress monitoring if downloadable
      if (availability === 'downloadable' && onProgress) {
        proofreader = await Proofreader.create({
          expectedInputLanguages: ['en'],
          monitor(m: any) {
            m.addEventListener('downloadprogress', (e: any) => {
              const progress = e.loaded * 100;
              onProgress(progress);
            });
          },
        });
      } else {
        proofreader = await Proofreader.create({
          expectedInputLanguages: ['en'],
        });
      }

      // Cache the proofreader instance
      this.proofreaderCache = proofreader;
    }

    // Proofread the text
    const result = await proofreader.proofread(text.trim());
    console.log('[Proofread]result', result);
    return String(result.correctedInput || text);
  }
}

