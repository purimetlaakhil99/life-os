import { Router } from 'express';
import { getMemories, createMemory, updateMemory, deleteMemory } from '../controllers/memoryController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { memorySchema } from '../utils/validators.js';

const router = Router();
router.use(requireAuth);

router.get('/', getMemories);
router.post('/', validate(memorySchema), createMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
