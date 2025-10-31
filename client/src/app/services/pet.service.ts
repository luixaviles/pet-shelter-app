import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, catchError, of } from 'rxjs';
import { Pet, AnimalTypeFilter, GenderFilter } from '../models/pet.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private petsSubject = new BehaviorSubject<Pet[]>([]);
  private animalTypeFilterSubject = new BehaviorSubject<AnimalTypeFilter>('all');
  private genderFilterSubject = new BehaviorSubject<GenderFilter>('all');

  pets$ = this.petsSubject.asObservable();

  filteredPets$: Observable<Pet[]> = combineLatest([
    this.pets$,
    this.animalTypeFilterSubject,
    this.genderFilterSubject
  ]).pipe(
    map(([pets, animalType, gender]) => {
      return pets.filter(pet => {
        const matchesAnimalType = animalType === 'all' || pet.animalType === animalType;
        const matchesGender = gender === 'all' || pet.gender === gender;
        return matchesAnimalType && matchesGender;
      });
    })
  );

  isAdminMode = signal(false);

  constructor(private http: HttpClient) {
    this.loadPets();
  }

  private loadPets(): void {
    this.http.get<ApiResponse<Pet[]>>(`${environment.apiUrl}/pets`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.petsSubject.next(response.data);
        } else {
          console.error('Error loading pets:', response.error);
          this.petsSubject.next([]);
        }
      },
      error: (error) => {
        console.error('Error loading pets:', error);
        this.petsSubject.next([]);
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
    this.animalTypeFilterSubject.next(filter);
  }

  setGenderFilter(filter: GenderFilter): void {
    this.genderFilterSubject.next(filter);
  }

  addPet(formData: FormData): Observable<Pet> {
    return this.http.post<ApiResponse<Pet>>(`${environment.apiUrl}/pets`, formData).pipe(
      map(response => {
        if (response.success && response.data) {
          // Update local state with the new pet from server
          const currentPets = this.petsSubject.value;
          this.petsSubject.next([...currentPets, response.data!]);
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
