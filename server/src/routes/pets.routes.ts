import { Router } from 'express';
import multer from 'multer';
import { getAllPets, createPet, getPetById } from '../controllers/pets.controller';

const router = Router();

// Configure multer for memory storage (to get Buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/', getAllPets);
router.get('/:id', getPetById);
router.post('/', upload.single('image'), createPet);

export default router;

