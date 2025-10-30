import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);

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
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
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
      return;
    }
    if (file.size > AddPetComponent.MAX_IMAGE_BYTES) {
      this.imageError = 'Image is too large (max 5MB).';
      return;
    }
    this.loadFileAsDataUrl(file)
      .then(dataUrl => {
        this.imagePreview = dataUrl;
        this.petForm.get('imageUrl')?.setValue(dataUrl);
        this.petForm.get('imageUrl')?.markAsDirty();
        this.petForm.get('imageUrl')?.markAsTouched();
      })
      .catch(() => {
        this.imageError = 'Failed to load image. Please try a different file.';
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
