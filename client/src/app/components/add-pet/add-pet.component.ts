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
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      description: ['']
    });
  }

  updateImagePreview(): void {
    const imageUrl = this.petForm.get('imageUrl')?.value;
    if (imageUrl && this.petForm.get('imageUrl')?.valid) {
      this.imagePreview = imageUrl;
    } else {
      this.imagePreview = '';
    }
  }

  onImageError(): void {
    this.imagePreview = '';
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
