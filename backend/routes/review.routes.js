import { Router } from 'express';
import { createReview, deleteReview, listMovieReviews } from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.get('/movie/:movieId', asyncHandler(listMovieReviews));
router.post('/movie/:movieId', authenticate, asyncHandler(createReview));
router.delete('/:reviewId', authenticate, asyncHandler(deleteReview));

export default router;
