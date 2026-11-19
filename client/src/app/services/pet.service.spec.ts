import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PetService } from './pet.service';
import { Pet } from '../models/pet.model';
import { environment } from '../../environments/environment';

const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: 'Whiskers',
    animalType: 'cat',
    breed: 'Siamese',
    gender: 'female',
    age: { years: 2, months: 3 },
    location: 'San Francisco, CA',
    adoptionDate: '2026-05-01',
    imageUrl: 'https://example.com/whiskers.jpg',
    description: 'Friendly indoor cat.'
  },
  {
    id: '2',
    name: 'Buddy',
    animalType: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    age: { years: 3, months: 0 },
    location: 'Oakland, CA',
    adoptionDate: '2026-05-02',
    imageUrl: 'https://example.com/buddy.jpg',
    description: 'Playful golden retriever.'
  },
  {
    id: '3',
    name: 'Luna',
    animalType: 'dog',
    breed: 'Beagle',
    gender: 'female',
    age: { years: 1, months: 6 },
    location: 'San Jose, CA',
    adoptionDate: '2026-05-03',
    imageUrl: 'https://example.com/luna.jpg',
    description: 'Curious beagle puppy.'
  }
];

describe('PetService', () => {
  let service: PetService;
  let httpMock: HttpTestingController;

  beforeAll(() => {
    try {
      TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
    } catch {
      // Already initialized by another test file
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PetService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(PetService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne(`${environment.apiUrl}/pets`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: MOCK_PETS });
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('loads all pets and exposes them via signals', () => {
    expect(service.pets()).toHaveLength(3);
    expect(service.filteredPets()).toHaveLength(3);
  });

  it('filters pets by animalType', () => {
    service.setAnimalTypeFilter('cat');
    expect(service.filteredPets().map(p => p.name)).toEqual(['Whiskers']);

    service.setAnimalTypeFilter('dog');
    expect(service.filteredPets().map(p => p.name)).toEqual(['Buddy', 'Luna']);

    service.setAnimalTypeFilter('all');
    expect(service.filteredPets()).toHaveLength(3);
  });

  it('filters pets by gender', () => {
    service.setGenderFilter('female');
    expect(service.filteredPets().map(p => p.name)).toEqual(['Whiskers', 'Luna']);

    service.setGenderFilter('male');
    expect(service.filteredPets().map(p => p.name)).toEqual(['Buddy']);
  });

  it('combines animalType and gender filters', () => {
    service.setAnimalTypeFilter('dog');
    service.setGenderFilter('female');
    expect(service.filteredPets().map(p => p.name)).toEqual(['Luna']);

    service.setAnimalTypeFilter('cat');
    service.setGenderFilter('male');
    expect(service.filteredPets()).toEqual([]);
  });

  it('appends newly added pets to the pets signal', () => {
    const newPet: Pet = {
      id: '4',
      name: 'Milo',
      animalType: 'cat',
      breed: 'Tabby',
      gender: 'male',
      age: { years: 0, months: 8 },
      location: 'San Francisco, CA',
      adoptionDate: '2026-05-10',
      imageUrl: 'https://example.com/milo.jpg',
      description: 'Energetic kitten.'
    };

    const formData = new FormData();
    formData.append('name', 'Milo');

    let created: Pet | undefined;
    service.addPet(formData).subscribe(pet => {
      created = pet;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/pets`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: newPet });

    expect(created).toEqual(newPet);
    expect(service.pets()).toHaveLength(4);
    service.setAnimalTypeFilter('cat');
    expect(service.filteredPets().map(p => p.name)).toEqual(['Whiskers', 'Milo']);
  });
});
