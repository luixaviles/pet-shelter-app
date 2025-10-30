import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

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

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      animalType: ['', Validators.required],
      breed: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      adoptionDate: ['', Validators.required],
      imageUrl: ['', [Validators.required]],
      description: ['']
    });
  }

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

  // UX-only: placeholder for AI Autofill action; service integration in next step
  onAiAutofillClick(): void {
    if (!this.imagePreview || this.isAiLoading) {
      return;
    }
    this.aiError = null;
    this.aiSummary = null;
    this.isAiLoading = true;
    this.cdr.markForCheck();
    // Placeholder: will be replaced by AiAssistService call
    setTimeout(() => {
      this.isAiLoading = false;
      this.aiSummary = 'AI suggestions ready (service not yet connected).';
      this.cdr.markForCheck();
    }, 300);
  }

  dismissAiSummary(): void {
    this.aiSummary = null;
    this.cdr.markForCheck();
  }

  retryAiAutofill(): void {
    this.onAiAutofillClick();
  }

  onSubmit(): void {
    if (this.petForm.valid) {
      this.isSubmitting = true;

      const newPet: Pet = {
        id: '',
        ...this.petForm.value
      };

      this.petService.addPet(newPet);

      setTimeout(() => {
        alert(`${newPet.name} has been successfully added to the adoption list!`);
        this.router.navigate(['/']);
      }, 500);
    } else {
      Object.keys(this.petForm.controls).forEach(key => {
        this.petForm.get(key)?.markAsTouched();
      });
    }
  }
}
