import { Router } from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  generateWish,
  scheduleAutomation,
  getHistory,
} from '../controllers/contactController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { contactSchema } from '../utils/validators.js';

const router = Router();
router.use(requireAuth);

router.get('/', getContacts);
router.post('/', validate(contactSchema), createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

router.post('/:id/generate-wish', generateWish);
router.post('/:id/schedule-automation', scheduleAutomation);
router.get('/history', getHistory);

export default router;
