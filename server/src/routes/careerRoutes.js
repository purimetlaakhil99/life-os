import { Router } from 'express';
import { listCareerItems, createCareerItem, updateCareerItem, deleteCareerItem } from '../controllers/careerController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', listCareerItems);
router.post('/', createCareerItem);
router.put('/:id', updateCareerItem);
router.delete('/:id', deleteCareerItem);

export default router;
