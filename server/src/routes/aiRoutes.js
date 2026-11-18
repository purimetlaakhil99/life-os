import { Router } from 'express';
import {
  handleAIChat,
  getConversations,
  previewAction,
  confirmAction,
  getDailyBriefing,
  getEveningRecap,
  decisionAssistant,
} from '../controllers/aiController.js';
import { requireAuth } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.post('/chat', aiLimiter, handleAIChat);
router.get('/conversations', getConversations);
router.post('/preview-action', previewAction);
router.post('/confirm-action', confirmAction);
router.get('/briefing', getDailyBriefing);
router.get('/evening-recap', getEveningRecap);
router.post('/decision-assistant', aiLimiter, decisionAssistant);

export default router;
