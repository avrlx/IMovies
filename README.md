# IMovies

IMovies is a movie discovery and cinema booking app built with React, Vite, Express, and MongoDB. The backend uses Mongoose and an MVC structure, with services handling database operations.

## Features

- User registration and login with bcrypt password hashing and JWT authentication
- Role-aware user and admin access
- Movie browsing and filtering, plus admin movie management
- Theatre and show management for admins
- Movie reviews with ownership checks and admin moderation
- Show seat availability, temporary seat locks, pending bookings, booking history, and cancellation
- Express security headers, CORS configuration, and API rate limiting

The checkout includes a local/demo payment confirmation flow; it records a completed payment and creates a downloadable or printable receipt, but it does not charge a real payment method. Notifications and live WebSocket updates are not implemented yet.

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection URI

## Run locally

### 1. Configure the backend

From the repository root, copy the backend environment template:

```bash
cp backend/.env.example backend/.env
```

Set `MONGO_URI` to your MongoDB connection string and replace the example `JWT_SECRET` with a long random secret. The local default uses the `imovies` database on port `27017`.
Add a TMDB Read Access Token as `TMDB_ACCESS_TOKEN` or an API Key as `TMDB_API_KEY` to load current real movie listings and posters. Create credentials in [TMDB account API settings](https://www.themoviedb.org/settings/api). Keep credentials private in `backend/.env`; never commit them. The app syncs current and upcoming movies in the configured region (`TMDB_REGION`, default `IN`) into MongoDB so existing movie details, showtime, and booking references keep working. Restart the backend after changing `.env`.

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend connects to MongoDB before listening on port `8000`. Its health endpoint is [http://localhost:8000/api/health](http://localhost:8000/api/health).

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend reads `VITE_API_URL` from `frontend/.env` if set; otherwise it uses `http://localhost:8000/api`.

### Optional: add demo catalogue data

With MongoDB configured, seed a small repeatable set of movies, a theatre with seat inventory, and showtimes:

```bash
cd backend
npm run seed:demo
```

The seed command is safe to rerun; it does not create duplicate demo movies or showtimes.

## Environment variables

Backend (`backend/.env`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGO_URI` | MongoDB connection string | none; required |
| `JWT_SECRET` | Secret used to sign and verify tokens | none; required for authentication |
| `JWT_EXPIRES_IN` | JWT lifetime | `7d` |
| `PORT` | Express port | `8000` |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `TMDB_ACCESS_TOKEN` | TMDB API Read Access Token (keep private) | required for real movie listings |
| `TMDB_API_KEY` | TMDB API Key fallback (keep private) | optional if access token is set |
| `TMDB_REGION` | Theatrical release region | `IN` |
| `TMDB_LANGUAGE` | Movie metadata language | `en-US` |

Frontend (`frontend/.env`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

## API overview

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Users | `GET /api/users/me` |
| Movies | `GET /api/movies`, `GET /api/movies/:movieId`; admin `POST /api/movies`, `PATCH /api/movies/:movieId`, `DELETE /api/movies/:movieId` |
| Theatres | `GET /api/theatres`, `GET /api/theatres/:theatreId`; admin `POST /api/theatres`, `PATCH /api/theatres/:theatreId`, `DELETE /api/theatres/:theatreId` |
| Shows | `GET /api/shows`, `GET /api/shows/:showId`; admin `POST /api/shows`, `PATCH /api/shows/:showId`, `DELETE /api/shows/:showId` |
| Seats and bookings | `GET /api/bookings/shows/:showId/seats`, `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/:bookingId`, `POST /api/bookings/:bookingId/pay`, `PATCH /api/bookings/:bookingId/cancel`; admin `GET /api/bookings` |
| Reviews | `GET /api/reviews/movie/:movieId`, `POST /api/reviews/movie/:movieId`, `DELETE /api/reviews/:reviewId` |

Protected endpoints use `Authorization: Bearer <token>`. Movie discovery supports `genre`, `language`, `minRating`, `status`, and `search` query parameters. Show discovery supports `movie`, `theatre`, and `date`.

## Project structure

```text
backend/
  index.js                 # Connects to MongoDB, then starts Express
  app.js                   # Middleware and route registration
  config/                  # Environment and database configuration
  controllers/             # HTTP request handlers
  middlewares/             # Authentication, authorization, and error handling
  models/                  # Mongoose schemas and indexes
  routes/                  # REST endpoints
  services/                # Movie, theatre, and show data operations
  utils/                   # Shared helpers
frontend/
  src/api/                 # Axios API client
  src/auth/                # Authentication context
  src/components/          # Shared route components
  src/pages/               # Application screens
```

## Build the frontend

```bash
cd frontend
npm run build
```
