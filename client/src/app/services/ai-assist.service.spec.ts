import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiAssistService } from './ai-assist.service';

describe('AiAssistService', () => {
  const originalLanguageModel = (globalThis as any).LanguageModel;
  const originalImage = globalThis.Image;

  afterEach(() => {
    (globalThis as any).LanguageModel = originalLanguageModel;
    globalThis.Image = originalImage;
  });

  it('destroys the Prompt API session in finally even when prompt rejects', async () => {
    const destroy = vi.fn();
    const prompt = vi.fn().mockRejectedValue(new Error('Prompt failed'));
    (globalThis as any).LanguageModel = {
      create: vi.fn().mockResolvedValue({ prompt, destroy })
    };

    class MockImage {
      crossOrigin = '';
      onload: (() => void) | null = null;
      onerror: ((err: unknown) => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    const service = new AiAssistService();
    await expect(service.analyzePetImage('data:image/png;base64,abc')).rejects.toThrow('Prompt failed');
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
