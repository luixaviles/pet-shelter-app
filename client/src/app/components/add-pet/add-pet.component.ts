import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { AiAssistService, PetImageAnalysis } from '../../services/ai-assist.service';
import { WriterAssistService } from '../../services/writer-assist.service';
import { ProofreaderService } from '../../services/proofreader.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-pet',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPetComponent {
  petForm: FormGroup;
  readonly imagePreview = signal('');
  readonly selectedImageFile = signal<File | null>(null);
  readonly isSubmitting = signal(false);
  readonly isDragOver = signal(false);
  readonly imageError = signal<string | null>(null);
  readonly isAiLoading = signal(false);
  readonly aiSummary = signal<string | null>(null);
  readonly aiError = signal<string | null>(null);
  readonly isImprovingDescription = signal(false);
  readonly improveDescError = signal<string | null>(null);
  readonly isProofreading = signal(false);
  readonly proofreadProgress = signal(0);
  readonly proofreadError = signal<string | null>(null);
  readonly descriptionLength: () => number;
  private lastAiResult: PetImageAnalysis | null = null;

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);
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

    this.descriptionLength = toSignal(
      this.petForm.controls['description'].valueChanges.pipe(
        map(value => String(value ?? '').length)
      ),
      { initialValue: 0 }
    );
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
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
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
    this.imageError.set(null);
    if (!file.type.startsWith('image/')) {
      this.imageError.set('Only image files are allowed.');
      return;
    }
    if (file.size > AddPetComponent.MAX_IMAGE_BYTES) {
      this.imageError.set('Image is too large (max 5MB).');
      return;
    }
    
    // Store the File object for FormData submission
    this.selectedImageFile.set(file);
    
    // Reset form fields when a new valid image is loaded (except imageUrl which will be set below)
    // Only reset if there was a previous image, to avoid clearing manually entered data on first load
    if (this.imagePreview()) {
      this.resetFormFields();
    }
    
    this.loadFileAsDataUrl(file)
      .then(dataUrl => {
        this.imagePreview.set(dataUrl);
        this.petForm.get('imageUrl')?.setValue(dataUrl);
        this.petForm.get('imageUrl')?.markAsDirty();
        this.petForm.get('imageUrl')?.markAsTouched();
      })
      .catch(() => {
        this.imageError.set('Failed to load image. Please try a different file.');
        this.selectedImageFile.set(null);
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
    this.aiSummary.set(null);
    this.aiError.set(null);
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
    this.imagePreview.set('');
    this.selectedImageFile.set(null);
    this.petForm.get('imageUrl')?.setValue('');
    this.petForm.get('imageUrl')?.markAsDirty();
    this.petForm.get('imageUrl')?.markAsTouched();
  }

  async onAiAutofillClick(): Promise<void> {
    const preview = this.imagePreview();
    if (!preview || this.isAiLoading()) {
      return;
    }
    this.aiError.set(null);
    this.aiSummary.set(null);
    this.isAiLoading.set(true);

    try {
      if (!this.aiAssist.isPromptApiAvailable()) {
        throw new Error('Chrome Prompt API with image input is unavailable.');
      }
      const result: PetImageAnalysis = await this.aiAssist.analyzePetImage(preview);
      // Required output: log to console for now
      console.log('[Autofill]', result);
      this.lastAiResult = result;
      const label = result.animal && result.animal !== 'unknown' ? result.animal : 'unknown animal';
      const breed = result.breed || 'unknown breed';
      this.aiSummary.set(`Detected: ${label} • ${breed}`);

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
      this.aiError.set(message);
      console.error('[Autofill][error]', err);
    } finally {
      this.isAiLoading.set(false);
    }
  }

  dismissAiSummary(): void {
    this.aiSummary.set(null);
  }

  retryAiAutofill(): void {
    this.onAiAutofillClick();
  }

  async onImproveDescriptionClick(): Promise<void> {
    const control = this.petForm.get('description');
    const current = String(control?.value ?? '').trim();
    if (!current || current.length < 10 || this.isImprovingDescription()) {
      return;
    }
    
    this.improveDescError.set(null);
    this.isImprovingDescription.set(true);

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
      
      control?.setValue(improved);
      control?.markAsDirty();
      control?.markAsTouched();
    } catch (err: any) {
      const message = err?.message || 'Failed to improve description. Please try again.';
      this.improveDescError.set(message);
      console.error('[Improve Description][error]', err);
    } finally {
      this.isImprovingDescription.set(false);
    }
  }

  async onProofreadClick(): Promise<void> {
    const control = this.petForm.get('description');
    const current = String(control?.value ?? '').trim();
    if (!current || current.length < 10 || this.isProofreading()) {
      return;
    }

    this.proofreadError.set(null);
    this.proofreadProgress.set(0);
    this.isProofreading.set(true);

    try {
      if (!this.proofreaderService.isProofreaderAvailable()) {
        throw new Error('Proofreader API is not available in this browser.');
      }

      const corrected = await this.proofreaderService.proofreadText(
        current,
        (progress) => {
          this.proofreadProgress.set(progress);
        }
      );

      console.log('[Proofread]', corrected);

      control?.setValue(corrected);
      control?.markAsDirty();
      control?.markAsTouched();
    } catch (err: any) {
      const message = err?.message || 'Failed to proofread description. Please try again.';
      this.proofreadError.set(message);
      console.error('[Proofread][error]', err);
    } finally {
      this.isProofreading.set(false);
      this.proofreadProgress.set(0);
    }
  }

  onSubmit(): void {
    // Validate that an image file is selected
    const imageFile = this.selectedImageFile();
    if (!imageFile) {
      this.imageError.set('Please select an image file.');
      return;
    }

    if (this.petForm.valid) {
      this.isSubmitting.set(true);

      const formValue = this.petForm.value;
      const ageYears = Number(formValue.ageYears) || 0;
      const ageMonths = Number(formValue.ageMonths) || 0;

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('image', imageFile);
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
          this.router.navigate(['/pet/list']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const errorMessage = error?.error?.error || error?.message || 'Failed to create pet. Please try again.';
          this.toastService.error(`Error: ${errorMessage}`);
        }
      });
    } else {
      Object.keys(this.petForm.controls).forEach(key => {
        this.petForm.get(key)?.markAsTouched();
      });
    }
  }
}
