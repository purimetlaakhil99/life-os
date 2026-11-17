import { Router } from 'express';
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from '../controllers/taskController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { taskSchema } from '../utils/validators.js';

const router = Router();
router.use(requireAuth);

router.get('/', getTasks);
router.post('/', validate(taskSchema), createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

export default router;
