import { Router } from 'express';
import { handleAIChat, previewAction, confirmAction, getDailyBriefing } from '../controllers/aiController.js';
import { requireAuth } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.post('/chat', aiLimiter, handleAIChat);
router.post('/preview-action', previewAction);
router.post('/confirm-action', confirmAction);
router.get('/briefing', getDailyBriefing);

export default router;
