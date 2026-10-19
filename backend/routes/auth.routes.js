import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', authenticate, (_request, response) => response.json({ success: true, message: 'Logout successful; discard the token on the client' }));
router.get('/me', authenticate, asyncHandler(getCurrentUser));
export default router;
