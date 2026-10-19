import { createMovie as saveMovie, deleteMovieById, findMovieById, findMovies, updateMovieById } from '../services/movie.service.js';
import { syncNowPlayingMovies } from '../services/tmdb.service.js';

function buildMovieFilter(request) {
  const { genre, language, minRating, status, search } = request.query;
  const filter = {};
  if (genre) filter.genre = genre;
  if (language) filter.language = new RegExp(`^${language}$`, 'i');
  if (status) filter.status = status;
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (search) filter.$text = { $search: search };
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit || '50', 10) || 50, 1), 100);
  return { filter, limit };
}

export async function listMovies(request, response) {
  const { filter, limit } = buildMovieFilter(request);
  const movies = await findMovies(filter, limit);
  return response.json({ success: true, movies });
}

export async function listRealMovies(request, response) {
  const { filter, limit } = buildMovieFilter(request);
  let source = 'tmdb';
  try {
    await syncNowPlayingMovies();
  } catch (error) {
    const cachedMovies = await findMovies({ tmdbId: { $exists: true } }, 1);
    if (!cachedMovies.length) throw error;
    source = 'tmdb-cache';
  }
  const movies = await findMovies({ ...filter, tmdbId: { $exists: true } }, limit);
  return response.json({ success: true, source, movies });
}

export async function getMovie(request, response) {
  const movie = await findMovieById(request.params.movieId);
  if (!movie) return response.status(404).json({ success: false, message: 'Movie not found' });
  return response.json({ success: true, movie });
}

export async function createMovie(request, response) {
  const movie = await saveMovie(request.body);
  return response.status(201).json({ success: true, movie });
}

export async function updateMovie(request, response) {
  const movie = await updateMovieById(request.params.movieId, request.body);
  if (!movie) return response.status(404).json({ success: false, message: 'Movie not found' });
  return response.json({ success: true, movie });
}

export async function deleteMovie(request, response) {
  const movie = await deleteMovieById(request.params.movieId);
  if (!movie) return response.status(404).json({ success: false, message: 'Movie not found' });
  return response.json({ success: true, message: 'Movie deleted' });
}
