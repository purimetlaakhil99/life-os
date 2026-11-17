import { Router } from 'express';
import { getSubscriptions, createSubscription, deleteSubscription } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.delete('/:id', deleteSubscription);

export default router;
