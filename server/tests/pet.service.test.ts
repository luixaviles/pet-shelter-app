import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PetService } from '../src/services/pet.service';
import type { CreatePetDto } from '../src/models/pet.model';

function makePetDto(overrides: Partial<CreatePetDto> = {}): CreatePetDto {
  return {
    name: 'Buddy',
    animalType: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    age: { years: 2, months: 6 },
    location: 'Austin, TX',
    adoptionDate: '2025-01-15',
    imageUrl: 'https://example.com/dog.jpg',
    description: 'Friendly dog',
    ...overrides,
  };
}

describe('PetService', () => {
  let tempDir: string;
  let petsFile: string;
  let service: PetService;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'pet-service-test-'));
    petsFile = join(tempDir, 'pets.json');
    service = new PetService(petsFile);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('returns an empty list when data file does not exist', async () => {
    const pets = await service.getAllPets();
    assert.deepEqual(pets, []);
  });

  it('adds a pet with id "1" when list is empty and defaults omitted description to ""', async () => {
    const dto = makePetDto({ description: undefined });
    const created = await service.addPet(dto);

    assert.equal(created.id, '1');
    assert.equal(created.description, '');

    const fetched = await service.getPetById('1');
    assert.deepEqual(fetched, created);
  });

  it('throws a not found error when requesting an unknown pet id', async () => {
    await assert.rejects(() => service.getPetById('999'), /not found/);
  });

  it('generates resilient IDs when existing pets contain non-numeric IDs', async () => {
    await writeFile(
      petsFile,
      JSON.stringify([
        { ...makePetDto({ name: 'Alpha' }), id: 'abc-uuid' },
        { ...makePetDto({ name: 'Beta' }), id: '5' },
        { ...makePetDto({ name: 'Gamma' }), id: '99-custom' },
      ]),
      'utf-8'
    );

    const created = await service.addPet(makePetDto({ name: 'Delta' }));
    assert.equal(created.id, '6');
  });

  it('starts at "1" when all existing pets have non-numeric IDs', async () => {
    await writeFile(
      petsFile,
      JSON.stringify([{ ...makePetDto({ name: 'Alpha' }), id: 'non-numeric' }]),
      'utf-8'
    );

    const created = await service.addPet(makePetDto({ name: 'Beta' }));
    assert.equal(created.id, '1');
  });

  it('serializes concurrent writes without losing updates or duplicating IDs', async () => {
    const count = 15;
    const results = await Promise.all(
      Array.from({ length: count }, (_, idx) =>
        service.addPet(makePetDto({ name: `Pet-${idx + 1}` }))
      )
    );

    const ids = results.map(pet => pet.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, count);

    const stored = await service.getAllPets();
    assert.equal(stored.length, count);
    assert.deepEqual(
      stored.map(pet => pet.id),
      Array.from({ length: count }, (_, idx) => String(idx + 1))
    );
  });
});
