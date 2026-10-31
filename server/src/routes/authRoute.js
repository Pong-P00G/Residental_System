import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createSession, getSession, logout } from '../controllers/authController.js';

const router = Router();

// The client signs in with Firebase and sends the ID token as a Bearer token.
router.post('/session', authenticate, createSession);
router.get('/session', authenticate, getSession);
router.post('/logout', authenticate, logout);

export default router;
