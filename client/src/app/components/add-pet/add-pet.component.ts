import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, NgZone } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { AiAssistService, PetImageAnalysis } from '../../services/ai-assist.service';
import { WriterAssistService } from '../../services/writer-assist.service';
import { ProofreaderService } from '../../services/proofreader.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

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
  selectedImageFile: File | null = null;
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
  isProofreading: boolean = false;
  proofreadProgress: number = 0;
  proofreadError: string | null = null;
  private lastAiResult: PetImageAnalysis | null = null;

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private aiAssist = inject(AiAssistService);
  private writerAssist = inject(WriterAssistService);
  private proofreaderService = inject(ProofreaderService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  constructor() {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      animalType: ['', Validators.required],
      breed: ['', Validators.required],
      gender: ['', Validators.required],
      ageYears: ['', [Validators.required, Validators.min(0)]],
      ageMonths: ['', [Validators.required, Validators.min(0), Validators.max(11)]],
      location: ['', Validators.required],
      adoptionDate: ['', [Validators.required, this.dateNotInPastValidator]],
      imageUrl: [''], // Keep for preview purposes, not for validation
      description: ['']
    }, { validators: this.ageValidator });
  }

  private dateNotInPastValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    // Parse YYYY-MM-DD string as local date (avoids timezone issues)
    const [year, month, day] = control.value.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    
    // Get today in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { dateInPast: true };
    }
    return null;
  };

  getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
    
    // Store the File object for FormData submission
    this.selectedImageFile = file;
    
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
        this.selectedImageFile = null;
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
    // Note: selectedImageFile is not reset here as it's set when a new file is selected
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
    this.selectedImageFile = null;
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

      // Auto-fill location from user service if empty
      const userLocation = this.userService.currentUser().location;
      setIfEmpty('location', userLocation);
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
    
    // Update state within Angular's zone to ensure change detection
    this.ngZone.run(() => {
      this.improveDescError = null;
      this.isImprovingDescription = true;
      this.cdr.markForCheck();
    });

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
      console.log('[Writer]', improved);
      
      // Update form and state within Angular's zone
      this.ngZone.run(() => {
        control?.setValue(improved);
        control?.markAsDirty();
        control?.markAsTouched();
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to improve description. Please try again.';
      // Update error state within Angular's zone
      this.ngZone.run(() => {
        this.improveDescError = message;
        this.cdr.markForCheck();
      });
      console.error('[Improve Description][error]', err);
    } finally {
      // Ensure state update happens within Angular's zone for proper change detection
      this.ngZone.run(() => {
        this.isImprovingDescription = false;
        this.cdr.markForCheck();
      });
    }
  }

  async onProofreadClick(): Promise<void> {
    const control = this.petForm.get('description');
    const current = String(control?.value ?? '').trim();
    if (!current || current.length < 10 || this.isProofreading) {
      return;
    }

    // Update state within Angular's zone to ensure change detection
    this.ngZone.run(() => {
      this.proofreadError = null;
      this.proofreadProgress = 0;
      this.isProofreading = true;
      this.cdr.markForCheck();
    });

    try {
      if (!this.proofreaderService.isProofreaderAvailable()) {
        throw new Error('Proofreader API is not available in this browser.');
      }

      const corrected = await this.proofreaderService.proofreadText(
        current,
        (progress) => {
          // Update progress within Angular's zone
          this.ngZone.run(() => {
            this.proofreadProgress = progress;
            this.cdr.markForCheck();
          });
        }
      );

      console.log('[Proofread]', corrected);

      // Update form and state within Angular's zone
      this.ngZone.run(() => {
        control?.setValue(corrected);
        control?.markAsDirty();
        control?.markAsTouched();
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to proofread description. Please try again.';
      // Update error state within Angular's zone
      this.ngZone.run(() => {
        this.proofreadError = message;
        this.cdr.markForCheck();
      });
      console.error('[Proofread][error]', err);
    } finally {
      // Ensure state update happens within Angular's zone for proper change detection
      this.ngZone.run(() => {
        this.isProofreading = false;
        this.proofreadProgress = 0;
        this.cdr.markForCheck();
      });
    }
  }

  onSubmit(): void {
    // Validate that an image file is selected
    if (!this.selectedImageFile) {
      this.imageError = 'Please select an image file.';
      this.cdr.markForCheck();
      return;
    }

    if (this.petForm.valid) {
      this.isSubmitting = true;
      this.cdr.markForCheck();

      const formValue = this.petForm.value;
      const ageYears = Number(formValue.ageYears) || 0;
      const ageMonths = Number(formValue.ageMonths) || 0;

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('image', this.selectedImageFile);
      formData.append('name', formValue.name);
      formData.append('animalType', formValue.animalType);
      formData.append('breed', formValue.breed);
      formData.append('gender', formValue.gender);
      formData.append('age', JSON.stringify({ years: ageYears, months: ageMonths }));
      formData.append('location', formValue.location);
      formData.append('adoptionDate', formValue.adoptionDate);
      formData.append('description', formValue.description || '');

      this.petService.addPet(formData).subscribe({
        next: (createdPet) => {
          this.toastService.success(`${createdPet.name} has been successfully added to the adoption list!`);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage = error?.error?.error || error?.message || 'Failed to create pet. Please try again.';
          this.toastService.error(`Error: ${errorMessage}`);
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
