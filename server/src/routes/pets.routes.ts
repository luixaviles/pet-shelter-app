import { Router } from 'express';
import { getAllPets, createPet } from '../controllers/pets.controller';

const router = Router();

router.get('/', getAllPets);
router.post('/', createPet);

export default router;

