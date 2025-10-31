import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Pet, CreatePetDto } from '../models/pet.model';

const PETS_FILE_PATH = join(__dirname, '../../data/pets.json');

export class PetService {
  private async readPets(): Promise<Pet[]> {
    try {
      const data = await readFile(PETS_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Pet[];
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writePets(pets: Pet[]): Promise<void> {
    const data = JSON.stringify(pets, null, 2);
    await writeFile(PETS_FILE_PATH, data, 'utf-8');
  }

  private generateId(pets: Pet[]): string {
    if (pets.length === 0) {
      return '1';
    }
    const maxId = Math.max(...pets.map(pet => parseInt(pet.id, 10)));
    return (maxId + 1).toString();
  }

  async getAllPets(): Promise<Pet[]> {
    return await this.readPets();
  }

  async addPet(petData: CreatePetDto): Promise<Pet> {
    const pets = await this.readPets();
    const newPet: Pet = {
      ...petData,
      id: this.generateId(pets),
    };
    pets.push(newPet);
    await this.writePets(pets);
    return newPet;
  }

  async getPetById(id: string): Promise<Pet> {
    const pets = await this.readPets();
    const pet = pets.find(p => p.id === id);
    if (!pet) {
      throw new Error(`Pet with id ${id} not found`);
    }
    return pet;
  }
}

