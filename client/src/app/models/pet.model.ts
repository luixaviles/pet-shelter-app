export interface Pet {
  id: string;
  name: string;
  animalType: 'cat' | 'dog';
  breed: string;
  gender: 'male' | 'female';
  age: { years: number; months: number };
  location: string;
  adoptionDate: string;
  imageUrl: string;
  description: string;
}

export type AnimalTypeFilter = 'all' | 'cat' | 'dog';
export type GenderFilter = 'all' | 'male' | 'female';
