import { Router } from 'express';
import { getSchedule, createEvent, deleteEvent, getSuggestedTimeSlots } from '../controllers/plannerController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { eventSchema } from '../utils/validators.js';

const router = Router();
router.use(requireAuth);

router.get('/schedule', getSchedule);
router.get('/free-slots', getSuggestedTimeSlots);
router.post('/events', validate(eventSchema), createEvent);
router.delete('/events/:id', deleteEvent);

export default router;
