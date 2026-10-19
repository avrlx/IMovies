import { createShow as saveShow, deleteShowById, findShowById, findShows, updateShowById } from '../services/show.service.js';
import Movie from '../models/movie.model.js';
import Show from '../models/show.model.js';
import Theatre from '../models/theatre.model.js';
import { createTheatre } from '../services/theatre.service.js';

const COMMON_SHOWTIMES = {
  '12:00': '14:30',
  '15:00': '17:30',
  '18:00': '20:30',
  '21:00': '23:30',
};

function parseShowDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export async function listShows(request, response) {
  const filter = {};
  const movieId = request.query.movie || request.query.movieId;
  if (movieId) filter.movie = movieId;
  if (request.query.theatre) filter.theatre = request.query.theatre;
  if (request.query.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(request.query.date)) {
      return response.status(400).json({ success: false, message: 'Date must be a valid YYYY-MM-DD value' });
    }
    const date = new Date(`${request.query.date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== request.query.date) {
      return response.status(400).json({ success: false, message: 'Date must be a valid YYYY-MM-DD value' });
    }
    filter.date = { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) };
  }
  const shows = await findShows(filter);
  return response.json({ success: true, shows });
}

export async function getShow(request, response) {
  const show = await findShowById(request.params.showId);
  if (!show) return response.status(404).json({ success: false, message: 'Show not found' });
  return response.json({ success: true, show });
}

export async function createShow(request, response) {
  const show = await saveShow(request.body);
  return response.status(201).json({ success: true, show });
}

export async function reserveCommonShow(request, response) {
  const { movieId, date: dateValue, startTime } = request.body || {};
  const date = parseShowDate(dateValue);
  if (!date || !COMMON_SHOWTIMES[startTime]) return response.status(400).json({ success: false, message: 'Choose a valid date and standard showtime' });

  const movie = await Movie.findById(movieId).select('_id').lean();
  if (!movie) return response.status(404).json({ success: false, message: 'Movie not found' });

  let theatre = await Theatre.findOne({ name: 'iMovies Cinema', location: 'Online' });
  if (!theatre) {
    theatre = await createTheatre({
      name: 'iMovies Cinema',
      location: 'Online',
      address: 'iMovies standard screening room',
      screens: [{ name: 'Standard screen', capacity: 80 }],
    });
  }
  const screen = theatre.screens[0];
  const show = await Show.findOneAndUpdate(
    { movie: movie._id, theatre: theatre._id, screen: screen._id, date, startTime },
    { $setOnInsert: { movie: movie._id, theatre: theatre._id, screen: screen._id, date, startTime, endTime: COMMON_SHOWTIMES[startTime], ticketPrice: 250 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return response.status(201).json({ success: true, showId: show._id });
}

export async function updateShow(request, response) {
  const show = await updateShowById(request.params.showId, request.body);
  if (!show) return response.status(404).json({ success: false, message: 'Show not found' });
  return response.json({ success: true, show });
}

export async function deleteShow(request, response) {
  const show = await deleteShowById(request.params.showId);
  if (!show) return response.status(404).json({ success: false, message: 'Show not found' });
  return response.json({ success: true, message: 'Show deleted' });
}
