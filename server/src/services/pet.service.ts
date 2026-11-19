import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Pet, CreatePetDto } from '../models/pet.model';

const PETS_FILE_PATH = join(__dirname, '../../data/pets.json');

export class PetService {
  private static writeQueues = new Map<string, Promise<unknown>>();
  private readonly filePath: string;

  constructor(filePath: string = PETS_FILE_PATH) {
    this.filePath = filePath;
  }

  private enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    const previous = PetService.writeQueues.get(this.filePath) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(operation);
    const settled = next.catch(() => undefined);
    PetService.writeQueues.set(this.filePath, settled);

    void settled.finally(() => {
      if (PetService.writeQueues.get(this.filePath) === settled) {
        PetService.writeQueues.delete(this.filePath);
      }
    });

    return next;
  }

  private async readPets(): Promise<Pet[]> {
    try {
      const data = await readFile(this.filePath, 'utf-8');
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
    await writeFile(this.filePath, data, 'utf-8');
  }

  private generateId(pets: Pet[]): string {
    const numericIds = pets
      .map(pet => (/^\d+$/.test(pet.id) ? parseInt(pet.id, 10) : NaN))
      .filter(id => Number.isFinite(id));

    if (numericIds.length === 0) {
      return '1';
    }
    const maxId = Math.max(...numericIds);
    return (maxId + 1).toString();
  }

  async getAllPets(): Promise<Pet[]> {
    return await this.readPets();
  }

  async addPet(petData: CreatePetDto): Promise<Pet> {
    return this.enqueueWrite(async () => {
      const pets = await this.readPets();
      const newPet: Pet = {
        ...petData,
        description: petData.description ?? '',
        id: this.generateId(pets),
      };
      pets.push(newPet);
      await this.writePets(pets);
      return newPet;
    });
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

