import type { Request, Response } from 'express';
import { PetService } from '../services/pet.service';
import type { CreatePetDto } from '../models/pet.model';
import FirebaseService from '../services/firebase.service';

export interface ImageUploader {
  uploadImageToStorage(
    imageBuffer: Buffer,
    animalType: 'cat' | 'dog',
    mimeType?: string
  ): Promise<string>;
}

export interface PetsControllerDeps {
  petService?: PetService;
  getFirebaseService?: () => ImageUploader;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function createPetsController(deps: PetsControllerDeps = {}) {
  const petService = deps.petService ?? new PetService();
  const getFirebaseService = deps.getFirebaseService ?? (() => FirebaseService.getInstance());

  const getAllPets = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pets = await petService.getAllPets();
      const response: ApiResponse<typeof pets> = {
        success: true,
        data: pets,
      };
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve pets',
      };
      res.status(500).json(response);
    }
  };

  const createPet = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate image file is present
      if (!req.file) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Image file is required',
        };
        res.status(400).json(response);
        return;
      }

      // Validate image file type
      if (!req.file.mimetype.startsWith('image/')) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Only image files are allowed',
        };
        res.status(400).json(response);
        return;
      }

      // Extract form fields
      const { name, animalType, breed, gender, age, location, adoptionDate, description } =
        req.body ?? {};

      // Validate required fields (description is optional)
      if (!name || !animalType || !breed || !gender || !age || !location || !adoptionDate) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Missing required fields',
        };
        res.status(400).json(response);
        return;
      }

      // Validate animalType
      if (animalType !== 'cat' && animalType !== 'dog') {
        const response: ApiResponse<never> = {
          success: false,
          error: "animalType must be either 'cat' or 'dog'",
        };
        res.status(400).json(response);
        return;
      }

      // Validate gender
      if (gender !== 'male' && gender !== 'female') {
        const response: ApiResponse<never> = {
          success: false,
          error: "gender must be either 'male' or 'female'",
        };
        res.status(400).json(response);
        return;
      }

      // Parse age (from form data, it comes as a string)
      let parsedAge: { years: number; months: number };
      try {
        parsedAge = typeof age === 'string' ? JSON.parse(age) : age;
      } catch {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid age format. age must be a valid JSON object with years and months',
        };
        res.status(400).json(response);
        return;
      }

      // Validate age structure
      if (
        !parsedAge ||
        typeof parsedAge.years !== 'number' ||
        typeof parsedAge.months !== 'number' ||
        parsedAge.years < 0 ||
        parsedAge.months < 0 ||
        parsedAge.months > 11
      ) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid age format. years must be >= 0 and months must be between 0 and 11',
        };
        res.status(400).json(response);
        return;
      }

      // Upload image to Firebase Storage
      let imageUrl: string;
      try {
        const firebaseService = getFirebaseService();
        imageUrl = await firebaseService.uploadImageToStorage(
          req.file.buffer,
          animalType as 'cat' | 'dog',
          req.file.mimetype
        );
      } catch (error) {
        const response: ApiResponse<never> = {
          success: false,
          error:
            error instanceof Error
              ? `Failed to upload image: ${error.message}`
              : 'Failed to upload image to Firebase Storage',
        };
        res.status(500).json(response);
        return;
      }

      // Create pet data with uploaded image URL
      const petData: CreatePetDto = {
        name,
        animalType: animalType as 'cat' | 'dog',
        breed,
        gender: gender as 'male' | 'female',
        age: parsedAge,
        location,
        adoptionDate,
        imageUrl,
        description: typeof description === 'string' ? description : '',
      };

      const newPet = await petService.addPet(petData);
      const response: ApiResponse<typeof newPet> = {
        success: true,
        data: newPet,
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<never> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create pet',
      };
      res.status(500).json(response);
    }
  };

  const getPetById = async (req: Request, res: Response): Promise<void> => {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Pet ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const pet = await petService.getPetById(id);
      const response: ApiResponse<typeof pet> = {
        success: true,
        data: pet,
      };
      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve pet';
      const response: ApiResponse<never> = {
        success: false,
        error: errorMessage,
      };
      // Check if it's a "not found" error
      if (errorMessage.includes('not found')) {
        res.status(404).json(response);
      } else {
        res.status(500).json(response);
      }
    }
  };

  return { getAllPets, createPet, getPetById };
}

const defaultController = createPetsController();

export const getAllPets = defaultController.getAllPets;
export const createPet = defaultController.createPet;
export const getPetById = defaultController.getPetById;

