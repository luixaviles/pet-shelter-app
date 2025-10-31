import { Router } from 'express';
import { getAllPets, createPet, getPetById } from '../controllers/pets.controller';

const router = Router();

router.get('/', getAllPets);
router.get('/:id', getPetById);
router.post('/', createPet);

export default router;

