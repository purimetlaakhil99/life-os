import { Router } from 'express';
import { universalCapture } from '../controllers/captureController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { captureSchema } from '../utils/validators.js';

const router = Router();
router.use(requireAuth);

router.post('/', validate(captureSchema), universalCapture);

export default router;
