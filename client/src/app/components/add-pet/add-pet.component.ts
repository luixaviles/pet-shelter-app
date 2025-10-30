import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <button
          routerLink="/"
          class="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 animate-fade-in"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Pets
        </button>

        <div class="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Add New Pet</h1>

          <form [formGroup]="petForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Pet Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter pet name"
              />
              <div
                *ngIf="petForm.get('name')?.invalid && petForm.get('name')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="petForm.get('name')?.errors?.['required']">Name is required.</span>
                <span *ngIf="petForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters.</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Animal Type <span class="text-red-500">*</span>
              </label>
              <select
                formControlName="animalType"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Select animal type</option>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
              </select>
              <div
                *ngIf="petForm.get('animalType')?.invalid && petForm.get('animalType')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Animal type is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Breed <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="breed"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter breed"
              />
              <div
                *ngIf="petForm.get('breed')?.invalid && petForm.get('breed')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Breed is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-6">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    formControlName="gender"
                    value="male"
                    class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-gray-700">Male</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    formControlName="gender"
                    value="female"
                    class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-gray-700">Female</span>
                </label>
              </div>
              <div
                *ngIf="petForm.get('gender')?.invalid && petForm.get('gender')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Gender is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Age (years) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                formControlName="age"
                min="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter age"
              />
              <div
                *ngIf="petForm.get('age')?.invalid && petForm.get('age')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="petForm.get('age')?.errors?.['required']">Age is required.</span>
                <span *ngIf="petForm.get('age')?.errors?.['min']">Age must be a positive number.</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Location <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="location"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="City, State"
              />
              <div
                *ngIf="petForm.get('location')?.invalid && petForm.get('location')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Location is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Adoption Date Available <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                formControlName="adoptionDate"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <div
                *ngIf="petForm.get('adoptionDate')?.invalid && petForm.get('adoptionDate')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Adoption date is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Image URL <span class="text-red-500">*</span>
              </label>
              <input
                type="url"
                formControlName="imageUrl"
                (input)="updateImagePreview()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
              />
              <div
                *ngIf="petForm.get('imageUrl')?.invalid && petForm.get('imageUrl')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="petForm.get('imageUrl')?.errors?.['required']">Image URL is required.</span>
                <span *ngIf="petForm.get('imageUrl')?.errors?.['pattern']">Please enter a valid URL.</span>
              </div>
              <div *ngIf="imagePreview && petForm.get('imageUrl')?.valid" class="mt-4">
                <p class="text-sm text-gray-600 mb-2">Image Preview:</p>
                <img
                  [src]="imagePreview"
                  alt="Preview"
                  class="w-full max-w-md rounded-lg shadow-md"
                  (error)="onImageError()"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                formControlName="description"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell us about this pet (personality, preferences, etc.)"
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">Optional: 3-4 sentences about the pet</p>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                [disabled]="petForm.invalid || isSubmitting"
                class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {{ isSubmitting ? 'Adding Pet...' : 'Add Pet' }}
              </button>
              <button
                type="button"
                routerLink="/"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AddPetComponent {
  petForm: FormGroup;
  imagePreview: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private router: Router
  ) {
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
