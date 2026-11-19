import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { Request, Response } from 'express';
import { createPetsController, type ImageUploader } from '../src/controllers/pets.controller';
import { PetService } from '../src/services/pet.service';

interface MockResponse {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Milo',
    animalType: 'cat',
    breed: 'Siamese',
    gender: 'male',
    age: JSON.stringify({ years: 1, months: 4 }),
    location: 'Seattle, WA',
    adoptionDate: '2025-02-01',
    ...overrides,
  };
}

function mockImageFile(mimetype = 'image/webp'): Express.Multer.File {
  return {
    fieldname: 'image',
    originalname: 'milo.webp',
    encoding: '7bit',
    mimetype,
    size: 16,
    buffer: Buffer.from('fake-image-bytes'),
    stream: null as unknown as Express.Multer.File['stream'],
    destination: '',
    filename: '',
    path: '',
  };
}

describe('pets.controller', () => {
  let tempDir: string;
  let petService: PetService;
  let uploadedCalls: Array<{ buffer: Buffer; animalType: 'cat' | 'dog'; mimeType?: string }>;
  let uploader: ImageUploader;
  let controller: ReturnType<typeof createPetsController>;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'pets-controller-test-'));
    petService = new PetService(join(tempDir, 'pets.json'));
    uploadedCalls = [];
    uploader = {
      async uploadImageToStorage(imageBuffer, animalType, mimeType) {
        uploadedCalls.push({ buffer: imageBuffer, animalType, mimeType });
        return `https://storage.example.com/${animalType}.webp`;
      },
    };
    controller = createPetsController({
      petService,
      getFirebaseService: () => uploader,
    });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('rejects createPet when image file is missing', async () => {
    const req = { body: validBody() } as unknown as Request;
    const res = createMockResponse();

    await controller.createPet(req, res as unknown as Response);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { success: false, error: 'Image file is required' });
  });

  it('rejects createPet when uploaded file is not an image', async () => {
    const req = {
      file: mockImageFile('application/pdf'),
      body: validBody(),
    } as unknown as Request;
    const res = createMockResponse();

    await controller.createPet(req, res as unknown as Response);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { success: false, error: 'Only image files are allowed' });
  });

  it('rejects createPet when required fields are missing', async () => {
    const req = {
      file: mockImageFile('image/jpeg'),
      body: validBody({ name: '' }),
    } as unknown as Request;
    const res = createMockResponse();

    await controller.createPet(req, res as unknown as Response);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { success: false, error: 'Missing required fields' });
  });

  it('allows description to be omitted and defaults it to empty string', async () => {
    const req = {
      file: mockImageFile('image/webp'),
      body: validBody(),
    } as unknown as Request;
    const res = createMockResponse();

    await controller.createPet(req, res as unknown as Response);
    assert.equal(res.statusCode, 201);

    const payload = res.body as { success: boolean; data: { description: string; id: string } };
    assert.equal(payload.success, true);
    assert.equal(payload.data.description, '');
    assert.equal(payload.data.id, '1');

    assert.equal(uploadedCalls.length, 1);
    assert.equal(uploadedCalls[0].mimeType, 'image/webp');
    assert.equal(uploadedCalls[0].animalType, 'cat');
  });

  it('preserves description when provided and forwards jpeg mimetype', async () => {
    const req = {
      file: mockImageFile('image/jpeg'),
      body: validBody({ description: 'Playful and affectionate' }),
    } as unknown as Request;
    const res = createMockResponse();

    await controller.createPet(req, res as unknown as Response);
    assert.equal(res.statusCode, 201);

    const payload = res.body as { success: boolean; data: { description: string } };
    assert.equal(payload.data.description, 'Playful and affectionate');
    assert.equal(uploadedCalls[0].mimeType, 'image/jpeg');
  });

  it('rejects invalid animalType, gender, and age', async () => {
    const cases: Array<{ body: Record<string, unknown>; expectedError: RegExp }> = [
      { body: validBody({ animalType: 'bird' }), expectedError: /animalType/ },
      { body: validBody({ gender: 'unknown' }), expectedError: /gender/ },
      { body: validBody({ age: 'not-json' }), expectedError: /Invalid age format/ },
      {
        body: validBody({ age: JSON.stringify({ years: 1, months: 12 }) }),
        expectedError: /months must be between 0 and 11/,
      },
    ];

    for (const testCase of cases) {
      const req = {
        file: mockImageFile('image/png'),
        body: testCase.body,
      } as unknown as Request;
      const res = createMockResponse();

      await controller.createPet(req, res as unknown as Response);
      assert.equal(res.statusCode, 400);
      const payload = res.body as { success: boolean; error: string };
      assert.equal(payload.success, false);
      assert.match(payload.error, testCase.expectedError);
    }
  });

  it('returns 200 for getAllPets and 404 for unknown getPetById', async () => {
    const resList = createMockResponse();
    await controller.getAllPets({} as Request, resList as unknown as Response);
    assert.equal(resList.statusCode, 200);
    assert.deepEqual(resList.body, { success: true, data: [] });

    const resMissing = createMockResponse();
    await controller.getPetById(
      { params: { id: '404' } } as unknown as Request,
      resMissing as unknown as Response
    );
    assert.equal(resMissing.statusCode, 404);
  });
});
