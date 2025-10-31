export interface Age {
  years: number;
  months: number;
}

export interface Pet {
  id: string;
  name: string;
  animalType: 'cat' | 'dog';
  breed: string;
  gender: 'male' | 'female';
  age: Age;
  location: string;
  adoptionDate: string;
  imageUrl: string;
  description: string;
}

export interface CreatePetDto {
  name: string;
  animalType: 'cat' | 'dog';
  breed: string;
  gender: 'male' | 'female';
  age: Age;
  location: string;
  adoptionDate: string;
  imageUrl: string;
  description: string;
}

