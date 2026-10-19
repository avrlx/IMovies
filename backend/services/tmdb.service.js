import { env } from '../config/env.js';
import Movie from '../models/movie.model.js';

const CACHE_TTL_MS = 15 * 60 * 1000;
const TMDB_API = 'https://api.themoviedb.org/3';
const TMDB_IMAGES = 'https://image.tmdb.org/t/p/w500';
const genreNames = new Map([
  [28, 'Action'], [12, 'Adventure'], [16, 'Animation'], [35, 'Comedy'],
  [80, 'Crime'], [99, 'Documentary'], [18, 'Drama'], [10751, 'Family'],
  [14, 'Fantasy'], [36, 'History'], [27, 'Horror'], [10402, 'Music'],
  [9648, 'Mystery'], [10749, 'Romance'], [878, 'Sci-Fi'],
  [10770, 'TV Movie'], [53, 'Thriller'], [10752, 'War'], [37, 'Western'],
]);

let cachedAt = 0;
let cachedMovies = [];
let syncInFlight;

async function tmdbGet(path) {
  const url = new URL(`${TMDB_API}${path}`);
  url.searchParams.set('language', env.tmdbLanguage);
  url.searchParams.set('region', env.tmdbRegion);
  if (!env.tmdbAccessToken?.trim() && env.tmdbApiKey?.trim()) {
    url.searchParams.set('api_key', env.tmdbApiKey.trim());
  }
  const headers = { accept: 'application/json' };
  if (env.tmdbAccessToken?.trim()) {
    headers.Authorization = `Bearer ${env.tmdbAccessToken.trim()}`;
  }
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const statusCode = response.status === 401 || response.status === 403 ? 503 : 502;
    const message = statusCode === 503
      ? 'TMDB rejected its credentials. Check TMDB_ACCESS_TOKEN or TMDB_API_KEY in backend/.env.'
      : 'The movie provider is temporarily unavailable. Please try again shortly.';
    throw Object.assign(new Error(message), { statusCode });
  }
  return response.json();
}

function toMovieRecord(result, status) {
  if (!result.id || !result.title || !/^\d{4}-\d{2}-\d{2}$/.test(result.release_date || '')) return null;
  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
  return {
    tmdbId: result.id,
    title: result.title.trim(),
    description: result.overview?.trim() || `${result.title} — movie details from TMDB.`,
    genre: [...new Set((result.genre_ids || []).map((id) => genreNames.get(id)).filter(Boolean))],
    language: languageNames.of(result.original_language) || result.original_language || 'Unknown',
    releaseDate: new Date(`${result.release_date}T00:00:00.000Z`),
    poster: result.poster_path ? `${TMDB_IMAGES}${result.poster_path}` : '',
    rating: Math.max(0, Math.min(10, Number(result.vote_average) || 0)),
    status,
  };
}

async function upsertMovies(results, status) {
  const records = results.map((result) => toMovieRecord(result, status)).filter(Boolean);
  return Promise.all(records.map((movie) => Movie.findOneAndUpdate(
    { tmdbId: movie.tmdbId },
    { $set: movie },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  )));
}

export async function syncNowPlayingMovies() {
  if (!env.tmdbAccessToken?.trim() && !env.tmdbApiKey?.trim()) {
    throw Object.assign(new Error('Real movie listings need a TMDB API credential. Add TMDB_ACCESS_TOKEN or TMDB_API_KEY to backend/.env, then restart the backend.'), { statusCode: 503 });
  }
  if (cachedAt > Date.now() - CACHE_TTL_MS) return cachedMovies;
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    try {
      const [nowPlaying, upcoming] = await Promise.all([
        tmdbGet('/movie/now_playing?page=1'),
        tmdbGet('/movie/upcoming?page=1'),
      ]);
      const currentResults = nowPlaying.results || [];
      const currentIds = new Set(currentResults.map((movie) => movie.id));
      const upcomingResults = (upcoming.results || []).filter((movie) => !currentIds.has(movie.id));
      const [currentMovies, upcomingMovies] = await Promise.all([
        upsertMovies(currentResults, 'now_showing'),
        upsertMovies(upcomingResults, 'upcoming'),
      ]);
      cachedMovies = [...currentMovies, ...upcomingMovies];
      cachedAt = Date.now();
      return cachedMovies;
    } finally {
      syncInFlight = undefined;
    }
  })();

  return syncInFlight;
}
