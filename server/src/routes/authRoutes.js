import { Router } from 'express';
import { register, login, demoLogin, getMe, logout, updateSettings } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/demo-login', demoLogin);
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.put('/settings', requireAuth, updateSettings);

export default router;
