import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { AiAssistService, PetImageAnalysis } from '../../services/ai-assist.service';
import { WriterAssistService } from '../../services/writer-assist.service';

@Component({
  selector: 'app-add-pet',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPetComponent {
  petForm: FormGroup;
  imagePreview: string = '';
  isSubmitting: boolean = false;
  isDragOver: boolean = false;
  imageError: string | null = null;
  // AI Autofill UI state (skeleton – service wiring added later)
  isAiLoading: boolean = false;
  aiSummary: string | null = null;
  aiError: string | null = null;
  allowOverwrite: boolean = false;
  isImprovingDescription: boolean = false;
  improveDescError: string | null = null;
  private lastAiResult: PetImageAnalysis | null = null;

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private aiAssist = inject(AiAssistService);
  private writerAssist = inject(WriterAssistService);

  constructor() {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      animalType: ['', Validators.required],
      breed: ['', Validators.required],
      gender: ['', Validators.required],
      ageYears: ['', [Validators.required, Validators.min(0)]],
      ageMonths: ['', [Validators.required, Validators.min(0), Validators.max(11)]],
      location: ['', Validators.required],
      adoptionDate: ['', Validators.required],
      imageUrl: ['', [Validators.required]],
      description: ['']
    }, { validators: this.ageValidator });
  }

  private ageValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const years = control.get('ageYears')?.value;
    const months = control.get('ageMonths')?.value;
    if ((years === null || years === undefined || years === '') && 
        (months === null || months === undefined || months === '')) {
      return null; // Let required validators handle empty values
    }
    const yearsNum = Number(years);
    const monthsNum = Number(months);
    if ((yearsNum === 0 || isNaN(yearsNum)) && (monthsNum === 0 || isNaN(monthsNum))) {
      return { ageRequired: true };
    }
    return null;
  };

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
    this.cdr.markForCheck();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    this.cdr.markForCheck();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleSelectedFile(file);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.handleSelectedFile(file);
      // reset input so selecting the same file again triggers change
      input.value = '';
    }
  }

  private handleSelectedFile(file: File): void {
    this.imageError = null;
    if (!file.type.startsWith('image/')) {
      this.imageError = 'Only image files are allowed.';
      this.cdr.markForCheck();
      return;
    }
    if (file.size > AddPetComponent.MAX_IMAGE_BYTES) {
      this.imageError = 'Image is too large (max 5MB).';
      this.cdr.markForCheck();
      return;
    }
    
    // Reset form fields when a new valid image is loaded (except imageUrl which will be set below)
    // Only reset if there was a previous image, to avoid clearing manually entered data on first load
    if (this.imagePreview) {
      this.resetFormFields();
    }
    
    this.loadFileAsDataUrl(file)
      .then(dataUrl => {
        this.imagePreview = dataUrl;
        this.petForm.get('imageUrl')?.setValue(dataUrl);
        this.petForm.get('imageUrl')?.markAsDirty();
        this.petForm.get('imageUrl')?.markAsTouched();
        this.cdr.markForCheck();
      })
      .catch(() => {
        this.imageError = 'Failed to load image. Please try a different file.';
        this.cdr.markForCheck();
      });
  }

  private resetFormFields(): void {
    // Store current imageUrl to preserve it
    const currentImageUrl = this.petForm.get('imageUrl')?.value;
    
    // Reset form with empty values, preserving imageUrl
    this.petForm.reset({
      imageUrl: currentImageUrl || '',
      name: '',
      animalType: '',
      breed: '',
      gender: '',
      ageYears: '',
      ageMonths: '',
      location: '',
      adoptionDate: '',
      description: ''
    });
    
    // Reset AI-related state
    this.aiSummary = null;
    this.aiError = null;
    this.lastAiResult = null;
  }

  private loadFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  removeImage(): void {
    this.imagePreview = '';
    this.petForm.get('imageUrl')?.setValue('');
    this.petForm.get('imageUrl')?.markAsDirty();
    this.petForm.get('imageUrl')?.markAsTouched();
    this.cdr.markForCheck();
  }

  async onAiAutofillClick(): Promise<void> {
    if (!this.imagePreview || this.isAiLoading) {
      return;
    }
    this.aiError = null;
    this.aiSummary = null;
    this.isAiLoading = true;
    this.cdr.markForCheck();

    try {
      if (!this.aiAssist.isPromptApiAvailable()) {
        throw new Error('Chrome Prompt API with image input is unavailable.');
      }
      const result: PetImageAnalysis = await this.aiAssist.analyzePetImage(this.imagePreview);
      // Required output: log to console for now
      console.log('[Autofill]', result);
      this.lastAiResult = result;
      const label = result.animal && result.animal !== 'unknown' ? result.animal : 'unknown animal';
      const breed = result.breed || 'unknown breed';
      this.aiSummary = `Detected: ${label} • ${breed}`;

      // Populate form fields (fill empty fields; do not overwrite user's entries)
      const form = this.petForm;
      const setIfEmpty = (controlName: string, value: any) => {
        const control = form.get(controlName);
        if (!control) { return; }
        const current = control.value;
        if (current === null || current === undefined || String(current).trim() === '') {
          control.setValue(value);
          control.markAsDirty();
          control.markAsTouched();
        }
      };

      if (result.animal === 'cat' || result.animal === 'dog') {
        setIfEmpty('animalType', result.animal);
      }
      if (result.breed) {
        setIfEmpty('breed', result.breed);
      }
      if (result.gender) {
        const normalizedGender = String(result.gender).toLowerCase().includes('female') ? 'female'
          : String(result.gender).toLowerCase().includes('male') ? 'male' : null;
        if (normalizedGender) {
          setIfEmpty('gender', normalizedGender);
        }
      }
      if (typeof result.age === 'object') { 
        setIfEmpty('ageYears', result.age?.years ?? 0);
        setIfEmpty('ageMonths', result.age?.months ?? 0);
      }
      if (result.name) {
        setIfEmpty('name', result.name);
      }

      // Default adoptionDate to today if empty
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setIfEmpty('adoptionDate', `${yyyy}-${mm}-${dd}`);
    } catch (err: any) {
      const message = err?.message || 'Failed to analyze image. Please try again.';
      this.aiError = message;
      console.error('[Autofill][error]', err);
    } finally {
      this.isAiLoading = false;
      this.cdr.markForCheck();
    }
  }

  dismissAiSummary(): void {
    this.aiSummary = null;
    this.cdr.markForCheck();
  }

  retryAiAutofill(): void {
    this.onAiAutofillClick();
  }

  async onImproveDescriptionClick(): Promise<void> {
    const control = this.petForm.get('description');
    const current = String(control?.value ?? '').trim();
    if (!current || current.length < 10 || this.isImprovingDescription) {
      return;
    }
    this.improveDescError = null;
    this.isImprovingDescription = true;
    this.cdr.markForCheck();

    try {
      const availability = await this.writerAssist.isWriterAvailable();
      if (availability === 'unavailable') {
        throw new Error('Writer API unavailable. Enable the Writer API or use a supported Chrome version.');
      }
      const formVals = this.petForm.value as any;
      const contextParts: string[] = [];
      if (this.lastAiResult?.description) contextParts.push(`AI notes: ${this.lastAiResult.description}`);
      if (formVals.name) contextParts.push(`Name: ${formVals.name}`);
      if (formVals.animalType) contextParts.push(`Animal: ${formVals.animalType}`);
      if (formVals.breed) contextParts.push(`Breed: ${formVals.breed}`);
      if (formVals.gender) contextParts.push(`Gender: ${formVals.gender}`);
      const ageYears = formVals.ageYears !== undefined && formVals.ageYears !== null && String(formVals.ageYears) !== '' ? Number(formVals.ageYears) : 0;
      const ageMonths = formVals.ageMonths !== undefined && formVals.ageMonths !== null && String(formVals.ageMonths) !== '' ? Number(formVals.ageMonths) : 0;
      if (ageYears > 0 || ageMonths > 0) {
        const ageParts: string[] = [];
        if (ageYears > 0) {
          ageParts.push(`${ageYears} ${ageYears === 1 ? 'year' : 'years'}`);
        }
        if (ageMonths > 0) {
          ageParts.push(`${ageMonths} ${ageMonths === 1 ? 'month' : 'months'}`);
        }
        contextParts.push(`Age: ${ageParts.join(' ')}`);
      }
      const context = contextParts.join('\n');

      const improved = await this.writerAssist.improveDescription({ current, context });
      console.log('[Improve Description]', improved);
      control?.setValue(improved);
      control?.markAsDirty();
      control?.markAsTouched();
    } catch (err: any) {
      const message = err?.message || 'Failed to improve description. Please try again.';
      this.improveDescError = message;
      console.error('[Improve Description][error]', err);
    } finally {
      this.isImprovingDescription = false;
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.petForm.valid) {
      this.isSubmitting = true;
      this.cdr.markForCheck();

      const formValue = this.petForm.value;
      const ageYears = Number(formValue.ageYears) || 0;
      const ageMonths = Number(formValue.ageMonths) || 0;

      const newPet: Pet = {
        id: '',
        name: formValue.name,
        animalType: formValue.animalType,
        breed: formValue.breed,
        gender: formValue.gender,
        age: { years: ageYears, months: ageMonths },
        location: formValue.location,
        adoptionDate: formValue.adoptionDate,
        imageUrl: formValue.imageUrl,
        description: formValue.description || ''
      };

      this.petService.addPet(newPet).subscribe({
        next: (createdPet) => {
          alert(`${createdPet.name} has been successfully added to the adoption list!`);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage = error?.error?.error || error?.message || 'Failed to create pet. Please try again.';
          alert(`Error: ${errorMessage}`);
          this.cdr.markForCheck();
        }
      });
    } else {
      Object.keys(this.petForm.controls).forEach(key => {
        this.petForm.get(key)?.markAsTouched();
      });
    }
  }
}
