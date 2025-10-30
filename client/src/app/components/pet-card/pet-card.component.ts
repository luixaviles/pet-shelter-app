import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-card',
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in">
      <div class="relative h-56 overflow-hidden">
        <img
          ngSrc="{{ pet().imageUrl }}"
          [alt]="pet().name"
          width="800"
          height="400"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div class="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-md">
          {{ pet().animalType === 'cat' ? '🐱' : '🐕' }} {{ pet().animalType }}
        </div>
      </div>

      <div class="p-5">
        <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ pet().name }}</h3>

        <div class="space-y-2 mb-4 text-gray-600">
          <div class="flex items-center">
            <span class="font-semibold mr-2">Breed:</span>
            <span>{{ pet().breed }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold mr-2">Gender:</span>
            <span class="capitalize">{{ pet().gender }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold mr-2">Age:</span>
            <span>{{ pet().age }} {{ pet().age === 1 ? 'year' : 'years' }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold mr-2">Location:</span>
            <span>{{ pet().location }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-semibold mr-2">Available:</span>
            <span>{{ pet().adoptionDate }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <a
            [routerLink]="['/pet', pet().id]"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-center"
          >
            View More
          </a>
          <button
            (click)="onAdopt()"
            class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Adopt Me
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetCardComponent {
  pet = input.required<Pet>();

  onAdopt(): void {
    alert(`Thank you for your interest in adopting ${this.pet().name}! Our team will contact you soon.`);
  }
}
