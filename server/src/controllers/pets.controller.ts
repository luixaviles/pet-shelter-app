import type { Request, Response } from 'express';
import { PetService } from '../services/pet.service';
import type { CreatePetDto } from '../models/pet.model';

const petService = new PetService();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getAllPets = async (_req: Request, res: Response): Promise<void> => {
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

export const createPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const petData = req.body as CreatePetDto;

    // Validation
    if (
      !petData.name ||
      !petData.animalType ||
      !petData.breed ||
      !petData.gender ||
      !petData.age ||
      !petData.location ||
      !petData.adoptionDate ||
      !petData.imageUrl ||
      !petData.description
    ) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields',
      };
      res.status(400).json(response);
      return;
    }

    // Validate animalType
    if (petData.animalType !== 'cat' && petData.animalType !== 'dog') {
      const response: ApiResponse<never> = {
        success: false,
        error: "animalType must be either 'cat' or 'dog'",
      };
      res.status(400).json(response);
      return;
    }

    // Validate gender
    if (petData.gender !== 'male' && petData.gender !== 'female') {
      const response: ApiResponse<never> = {
        success: false,
        error: "gender must be either 'male' or 'female'",
      };
      res.status(400).json(response);
      return;
    }

    // Validate age
    if (
      typeof petData.age.years !== 'number' ||
      typeof petData.age.months !== 'number' ||
      petData.age.years < 0 ||
      petData.age.months < 0 ||
      petData.age.months > 11
    ) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid age format. years must be >= 0 and months must be between 0 and 11',
      };
      res.status(400).json(response);
      return;
    }

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

export const getPetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

