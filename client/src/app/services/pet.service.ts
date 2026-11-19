import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Pet, AnimalTypeFilter, GenderFilter } from '../models/pet.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private http = inject(HttpClient);

  private readonly petsState = signal<Pet[]>([]);
  readonly pets = this.petsState.asReadonly();
  readonly animalTypeFilter = signal<AnimalTypeFilter>('all');
  readonly genderFilter = signal<GenderFilter>('all');

  readonly filteredPets = computed(() => {
    const animalType = this.animalTypeFilter();
    const gender = this.genderFilter();
    return this.petsState().filter(pet => {
      const matchesAnimalType = animalType === 'all' || pet.animalType === animalType;
      const matchesGender = gender === 'all' || pet.gender === gender;
      return matchesAnimalType && matchesGender;
    });
  });

  readonly isAdminMode = signal(true);

  constructor() {
    this.loadPets();
  }

  private loadPets(): void {
    this.http.get<ApiResponse<Pet[]>>(`${environment.apiUrl}/pets`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.petsState.set(response.data);
        } else {
          console.error('Error loading pets:', response.error);
          this.petsState.set([]);
        }
      },
      error: (error) => {
        console.error('Error loading pets:', error);
        this.petsState.set([]);
      }
    });
  }

  getPetById(id: string): Observable<Pet | undefined> {
    return this.http.get<ApiResponse<Pet>>(`${environment.apiUrl}/pets/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return undefined;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(undefined);
        }
        console.error('Error loading pet:', error);
        return of(undefined);
      })
    );
  }

  setAnimalTypeFilter(filter: AnimalTypeFilter): void {
    this.animalTypeFilter.set(filter);
  }

  setGenderFilter(filter: GenderFilter): void {
    this.genderFilter.set(filter);
  }

  addPet(formData: FormData): Observable<Pet> {
    return this.http.post<ApiResponse<Pet>>(`${environment.apiUrl}/pets`, formData).pipe(
      map(response => {
        if (response.success && response.data) {
          // Update local state with the new pet from server
          this.petsState.update(currentPets => [...currentPets, response.data!]);
          return response.data;
        }
        throw new Error(response.error || 'Failed to create pet');
      }),
      catchError(error => {
        console.error('Error creating pet:', error);
        throw error;
      })
    );
  }

  toggleAdminMode(): void {
    this.isAdminMode.update(value => !value);
  }
}
