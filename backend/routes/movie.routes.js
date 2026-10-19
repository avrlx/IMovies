import { Router } from 'express';
import { createMovie, deleteMovie, getMovie, listMovies, listRealMovies, updateMovie } from '../controllers/movie.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = Router();
router.get('/real', asyncHandler(listRealMovies));
router.get('/', asyncHandler(listMovies));
router.get('/:movieId', asyncHandler(getMovie));
router.post('/', authenticate, authorize('admin'), asyncHandler(createMovie));
router.patch('/:movieId', authenticate, authorize('admin'), asyncHandler(updateMovie));
router.delete('/:movieId', authenticate, authorize('admin'), asyncHandler(deleteMovie));
export default router;
