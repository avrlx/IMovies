import { Router } from 'express';
import { createTheatre, deleteTheatre, getTheatre, listTheatres, updateTheatre } from '../controllers/theatre.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = Router();
router.get('/', asyncHandler(listTheatres));
router.get('/:theatreId', asyncHandler(getTheatre));
router.post('/', authenticate, authorize('admin'), asyncHandler(createTheatre));
router.patch('/:theatreId', authenticate, authorize('admin'), asyncHandler(updateTheatre));
router.delete('/:theatreId', authenticate, authorize('admin'), asyncHandler(deleteTheatre));
export default router;
