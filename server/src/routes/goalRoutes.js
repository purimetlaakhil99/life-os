import { Router } from 'express';
import { getGoals, createGoal, updateGoal, deleteGoal, logHabit } from '../controllers/goalController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/habit-log', logHabit);

export default router;
