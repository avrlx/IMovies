import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { formatIndianCurrency, formatIndianTime } from '../utils/formatters.js';

const commonShowtimes = [
  { startTime: '12:00', endTime: '14:30' },
  { startTime: '15:00', endTime: '17:30' },
  { startTime: '18:00', endTime: '20:30' },
  { startTime: '21:00', endTime: '23:30' },
];

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MovieDetails() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => localDateString(new Date()));
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);
  const [error, setError] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingMovie(true);
    setError('');
    apiRequest(`/movies/${movieId}`)
      .then(({ movie: result }) => { if (active) setMovie(result); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoadingMovie(false); });
    return () => { active = false; };
  }, [movieId]);

  useEffect(() => {
    let active = true;
    setLoadingShows(true);
    apiRequest(`/shows?movie=${encodeURIComponent(movieId)}&date=${selectedDate}`)
      .then(({ shows: result }) => { if (active) setShows(result || []); })
      .catch((requestError) => { if (active) { setShows([]); setError(requestError.message); } })
      .finally(() => { if (active) setLoadingShows(false); });
    return () => { active = false; };
  }, [movieId, selectedDate]);

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

  async function bookCommonShow(startTime) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setBookingTime(startTime);
    setError('');
    try {
      const { showId } = await apiRequest('/shows/common', { method: 'POST', body: { movieId, date: selectedDate, startTime } });
      navigate(`/seats/${showId}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBookingTime('');
    }
  }

  if (loadingMovie) return <div className="state-panel"><span className="spinner" />Loading movie…</div>;
  if (!movie) return <div className="state-panel"><h1>We couldn’t load that movie.</h1><p>{error || 'It may have been removed.'}</p><Link className="button button-primary" to="/movies">Browse movies</Link></div>;

  return <div className="page-wrap movie-detail-page">
    <section className="movie-hero">
      <div className="movie-detail-poster">{movie.poster ? <img src={movie.poster} alt={`${movie.title} poster`} /> : <span>{movie.title}</span>}</div>
      <div className="movie-detail-copy">
        <p className="eyebrow">{movie.status?.replaceAll('_', ' ') || 'Now showing'}</p>
        <h1>{movie.title}</h1>
        <div className="movie-meta"><span>★ {Number(movie.rating || 0).toFixed(1)}</span><span>{movie.language}</span>{movie.duration > 0 && <span>{movie.duration} min</span>}<span>{movie.genre?.join(' · ')}</span></div>
        <p className="movie-description">{movie.description}</p>
        {movie.cast?.length > 0 && <p className="cast-line"><strong>Cast</strong> {movie.cast.join(', ')}</p>}
        <a className="text-link" href="#showtimes">Choose a showtime <span>↓</span></a>
      </div>
    </section>

    <section className="showtime-section" id="showtimes">
      <div className="section-heading"><div><p className="eyebrow">Find your screening</p><h2>Showtimes</h2></div><span className="section-note">Times are shown in local theatre time</span></div>
      <div className="date-scroller">{dates.map((date) => {
        const value = localDateString(date);
        return <button key={value} type="button" className={`date-pill ${selectedDate === value ? 'is-active' : ''}`} onClick={() => setSelectedDate(value)}>
          <span>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span><strong>{date.getDate()}</strong><span>{date.toLocaleDateString('en-IN', { month: 'short' })}</span>
        </button>;
      })}</div>
      {error && <div className="inline-alert" role="alert">{error}</div>}
      {loadingShows ? <div className="state-inline"><span className="spinner" />Finding showtimes…</div> : shows.length ? <div className="show-list">
        {shows.map((show) => <article className="show-card" key={show._id}>
          <div><h3>{show.theatre?.name || 'Cinema'}</h3><p>{show.theatre?.location}</p><small>{new Date(show.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {show.theatre?.screens?.find((screen) => screen._id === show.screen)?.name || 'Screen'}</small></div>
          <div className="show-card-action"><span>{formatIndianTime(show.startTime)} – {formatIndianTime(show.endTime)}</span><small>From {formatIndianCurrency(show.ticketPrice)} / seat</small><Link className="button button-primary" to={`/seats/${show._id}`}>Book this show</Link></div>
        </article>)}
      </div> : <div className="common-showtimes"><div className="common-showtimes-heading"><span className="empty-icon">◷</span><div><h3>Standard showtimes</h3><p>Pick a time to book this movie. A seat map will be ready for your selection.</p></div></div><div className="show-list">{commonShowtimes.map((show) => <article className="show-card" key={show.startTime}><div><h3>iMovies Cinema</h3><p>Standard screening</p><small>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</small></div><div className="show-card-action"><span>{formatIndianTime(show.startTime)} – {formatIndianTime(show.endTime)}</span><small>{formatIndianCurrency(250)} / seat</small><button className="button button-primary" type="button" disabled={Boolean(bookingTime)} onClick={() => bookCommonShow(show.startTime)}>{bookingTime === show.startTime ? 'Preparing…' : 'Book this show'}</button></div></article>)}</div></div>}
    </section>
  </div>;
}
