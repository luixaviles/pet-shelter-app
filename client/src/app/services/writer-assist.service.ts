import { Injectable } from '@angular/core';

export type WriterAvailability = 'available' | 'after-download' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class WriterAssistService {
  async isWriterAvailable(): Promise<WriterAvailability> {
    try {
      const availability = await (globalThis as any).Writer?.availability?.();
      return availability ?? 'unavailable';
    } catch {
      return 'unavailable';
    }
  }

  async improveDescription(params: { current: string; context?: string }): Promise<string> {
    const { current, context } = params;
    if (!current || current.trim().length === 0) {
      return current;
    }

    const Writer: any = (globalThis as any).Writer;
    if (!Writer?.create) {
      throw new Error('Writer API is unavailable.');
    }

    // Friendly, persuasive copy for a pet shelter listing.
    const options = {
      tone: 'neutral', // friendly-neutral
      format: 'plain-text',
      length: 'medium',
    } as const;

    // Use streaming for responsiveness; concatenate chunks (see demo reference)
    const writer = await Writer.create(options);
    const prompt = `Rewrite and elevate this pet adoption description. Keep it warm, vivid, and persuasive, suitable for a pet shelter listing. 2-4 sentences. Avoid making up facts; do not contradict provided details.

Description to improve:
${current.trim()}`;

    const stream = writer.writeStreaming(prompt, {
      context: (context ?? '').trim(),
    });

    let full = '';
    for await (const chunk of stream) {
      // In Canary, chunk is the new delta; in Stable, chunk is entire response.
      full = 'Writer' in globalThis ? full + chunk : chunk;
    }

    return full.trim();
  }
}
