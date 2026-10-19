import { Router } from 'express';
import { createShow, deleteShow, getShow, listShows, reserveCommonShow, updateShow } from '../controllers/show.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = Router();
router.get('/', asyncHandler(listShows));
router.post('/common', authenticate, asyncHandler(reserveCommonShow));
router.get('/:showId', asyncHandler(getShow));
router.post('/', authenticate, authorize('admin'), asyncHandler(createShow));
router.patch('/:showId', authenticate, authorize('admin'), asyncHandler(updateShow));
router.delete('/:showId', authenticate, authorize('admin'), asyncHandler(deleteShow));
export default router;
