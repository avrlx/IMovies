import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import reviewRouter from './routes/review.routes.js';
import movieRouter from './routes/movie.routes.js';
import theatreRouter from './routes/theatre.routes.js';
import showRouter from './routes/show.routes.js';
import bookingRouter from './routes/booking.routes.js';
import userRouter from './routes/user.routes.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://image.tmdb.org', 'https://www.themoviedb.org'],
    },
  },
}));
app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || env.clientOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/', (_request, response) => {
  response.json({ message: 'Welcome to the IMovies API' });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/movies', movieRouter);
app.use('/api/theatres', theatreRouter);
app.use('/api/shows', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/users', userRouter);

app.use((_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
