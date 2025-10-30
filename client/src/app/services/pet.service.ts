import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { Pet, AnimalTypeFilter, GenderFilter } from '../models/pet.model';

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
    this.http.get<Pet[]>('/assets/pets.json').subscribe({
      next: (pets) => this.petsSubject.next(pets),
      error: (error) => console.error('Error loading pets:', error)
    });
  }

  getPetById(id: string): Observable<Pet | undefined> {
    return this.pets$.pipe(
      map(pets => pets.find(pet => pet.id === id))
    );
  }

  setAnimalTypeFilter(filter: AnimalTypeFilter): void {
    this.animalTypeFilterSubject.next(filter);
  }

  setGenderFilter(filter: GenderFilter): void {
    this.genderFilterSubject.next(filter);
  }

  addPet(pet: Pet): void {
    const currentPets = this.petsSubject.value;
    const newPet = {
      ...pet,
      id: (Math.max(...currentPets.map(p => parseInt(p.id))) + 1).toString()
    };
    this.petsSubject.next([...currentPets, newPet]);
  }

  toggleAdminMode(): void {
    this.isAdminMode.update(value => !value);
  }
}
