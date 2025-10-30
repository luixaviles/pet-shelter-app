import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { Pet, AnimalTypeFilter, GenderFilter } from '../../models/pet.model';
import { PetCardComponent } from '../pet-card/pet-card.component';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, PetCardComponent],
  template: `
    <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <header class="text-center mb-10 animate-fade-in">
          <h1 class="text-5xl font-bold text-gray-800 mb-3">
            🐾 Find Your Perfect Companion
          </h1>
          <p class="text-xl text-gray-600">
            Browse our adorable pets looking for their forever homes
          </p>
        </header>

        <div class="bg-white rounded-xl shadow-md p-6 mb-8 animate-slide-up">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Animal Type
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  (click)="setAnimalTypeFilter('all')"
                  [class.bg-primary-500]="currentAnimalType === 'all'"
                  [class.text-white]="currentAnimalType === 'all'"
                  [class.bg-gray-200]="currentAnimalType !== 'all'"
                  [class.text-gray-700]="currentAnimalType !== 'all'"
                  class="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  All Pets
                </button>
                <button
                  (click)="setAnimalTypeFilter('cat')"
                  [class.bg-primary-500]="currentAnimalType === 'cat'"
                  [class.text-white]="currentAnimalType === 'cat'"
                  [class.bg-gray-200]="currentAnimalType !== 'cat'"
                  [class.text-gray-700]="currentAnimalType !== 'cat'"
                  class="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  🐱 Cats Only
                </button>
                <button
                  (click)="setAnimalTypeFilter('dog')"
                  [class.bg-primary-500]="currentAnimalType === 'dog'"
                  [class.text-white]="currentAnimalType === 'dog'"
                  [class.bg-gray-200]="currentAnimalType !== 'dog'"
                  [class.text-gray-700]="currentAnimalType !== 'dog'"
                  class="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  🐕 Dogs Only
                </button>
              </div>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  (click)="setGenderFilter('all')"
                  [class.bg-blue-600]="currentGender === 'all'"
                  [class.text-white]="currentGender === 'all'"
                  [class.bg-gray-200]="currentGender !== 'all'"
                  [class.text-gray-700]="currentGender !== 'all'"
                  class="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  All
                </button>
                <button
                  (click)="setGenderFilter('male')"
                  [class.bg-blue-600]="currentGender === 'male'"
                  [class.text-white]="currentGender === 'male'"
                  [class.bg-gray-200]="currentGender !== 'male'"
                  [class.text-gray-700]="currentGender !== 'male'"
                  class="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  Male
                </button>
                <button
                  (click)="setGenderFilter('female')"
                  [class.bg-blue-600]="currentGender === 'female'"
                  [class.text-white]="currentGender === 'female'"
                  [class.bg-gray-200]="currentGender !== 'female'"
                  [class.text-gray-700]="currentGender !== 'female'"
                  class="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 text-center text-gray-600">
            <span class="font-semibold">{{ (filteredPets$ | async)?.length || 0 }}</span> pets found
          </div>
        </div>

        <div
          *ngIf="(filteredPets$ | async)?.length === 0"
          class="text-center py-16 animate-fade-in"
        >
          <p class="text-2xl text-gray-500">
            No pets match your current filters. Try adjusting your search!
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <app-pet-card
            *ngFor="let pet of filteredPets$ | async"
            [pet]="pet"
          ></app-pet-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PetListComponent implements OnInit {
  filteredPets$!: Observable<Pet[]>;
  currentAnimalType: AnimalTypeFilter = 'all';
  currentGender: GenderFilter = 'all';

  constructor(private petService: PetService) {}

  ngOnInit(): void {
    this.filteredPets$ = this.petService.filteredPets$;
  }

  setAnimalTypeFilter(filter: AnimalTypeFilter): void {
    this.currentAnimalType = filter;
    this.petService.setAnimalTypeFilter(filter);
  }

  setGenderFilter(filter: GenderFilter): void {
    this.currentGender = filter;
    this.petService.setGenderFilter(filter);
  }
}
