import { Router } from 'express';
import { getCurrentUser } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/me', authenticate, asyncHandler(getCurrentUser));
export default router;
