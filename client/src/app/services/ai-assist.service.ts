import { Injectable } from '@angular/core';

export type PetImageAnalysis = {
  animal: 'cat' | 'dog' | 'unknown';
  breed: string;
  confidence?: number;
  raw: string;
};

function isPromptApiAvailable(): boolean {
  return typeof (globalThis as any).LanguageModel?.create === 'function';
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

@Injectable({ providedIn: 'root' })
export class AiAssistService {
  public isPromptApiAvailable(): boolean {
    return isPromptApiAvailable();
  }

  async analyzePetImage(dataUrl: string): Promise<PetImageAnalysis> {
    if (!this.isPromptApiAvailable()) {
      throw new Error('Chrome Prompt API with image input is unavailable.');
    }

    const imageEl = await loadImageFromDataUrl(dataUrl);

    const prompt = `You are a precise image classifier. 
    Identify if the image shows a cat or a dog and infer the likely breed, gender, and age(in years), providing a description of the pet. The description must be based on the pet in the image(omit age and breed for the description).
    Respond ONLY with minified JSON with keys: animal ('cat'|'dog'|'unknown'), breed (string), gender (string), age (number), confidence (0..1), description (string). No extra text.`;

    const LanguageModel: any = (globalThis as any).LanguageModel;
    const session = await LanguageModel.create({ expectedInputs: [{ type: 'image' }] });
    const response = await session.prompt([
      {
        role: 'user',
        content: [
          { type: 'text', value: prompt },
          { type: 'image', value: imageEl },
        ],
      },
    ]);

    const rawText = String(response);
    console.log('[AI Autofill][rawText]', rawText);

    // Attempt strict JSON extraction
    let parsed: any = null;
    try {
      // Some models may include backticks or preambles; attempt to find JSON substring
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      const jsonSlice = firstBrace !== -1 && lastBrace !== -1 ? rawText.slice(firstBrace, lastBrace + 1) : rawText;
      parsed = JSON.parse(jsonSlice);
    } catch {
      // Fallback: return unknown with raw content
      const fallback: PetImageAnalysis = {
        animal: 'unknown',
        breed: '',
        raw: rawText,
      };
      console.log('[AI Autofill][fallback]', fallback);
      return fallback;
    }

    const analysis: PetImageAnalysis = {
      animal:
        parsed?.animal === 'cat' || parsed?.animal === 'dog'
          ? parsed.animal
          : 'unknown',
      breed: typeof parsed?.breed === 'string' ? parsed.breed : '',
      confidence:
        typeof parsed?.confidence === 'number' && parsed.confidence >= 0 && parsed.confidence <= 1
          ? parsed.confidence
          : undefined,
      raw: rawText,
    };

    console.log('[AI Autofill][result]', analysis);
    return analysis;
  }
}
