import Movie from '../models/movie.model.js';

export function findMovies(filter, limit = 50) { return Movie.find(filter).sort({ releaseDate: -1 }).limit(limit).lean(); }
export function findMovieById(movieId) { return Movie.findById(movieId).lean(); }
export function createMovie(data) { return Movie.create(data); }
export function updateMovieById(movieId, data) { return Movie.findByIdAndUpdate(movieId, data, { new: true, runValidators: true }).lean(); }
export function deleteMovieById(movieId) { return Movie.findByIdAndDelete(movieId); }
