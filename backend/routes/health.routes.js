import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'IMovies API is healthy',
  });
});

export default router;
