import { Router } from 'express';
import {
  getAuthUrl,
  handleCallback,
  getGoogleStatus,
  disconnectGoogle,
} from '../controllers/googleIntegrationController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Callback does not require auth middleware because it comes from Google's redirect
router.get('/google/callback', handleCallback);

// Authenticated integration routes
router.get('/google/auth-url', requireAuth, getAuthUrl);
router.get('/google/status', requireAuth, getGoogleStatus);
router.post('/google/disconnect', requireAuth, disconnectGoogle);

export default router;
