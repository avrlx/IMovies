import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const posterUrl = typeof movie.poster === 'string' ? movie.poster : movie.poster?.url;
  const releaseDate = movie.releaseDate
    ? new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(movie.releaseDate))
    : movie.language || 'Now showing';
  return (
    <Link className="movie-poster-card" to={`/movie/${movie._id}`}>
      <div className="poster-frame">
        {posterUrl ? <img src={posterUrl} alt={`${movie.title} poster`} loading="lazy" onError={(event) => { event.currentTarget.replaceWith(Object.assign(document.createElement('span'), { className: 'poster-fallback', textContent: movie.title })); }} /> : <span className="poster-fallback">{movie.title}</span>}
        <span className="poster-rating">★ {Number(movie.rating || 0).toFixed(1)}</span>
        <span className="poster-cta">Showtimes <b>↗</b></span>
      </div>
      <div className="poster-card-copy"><h2 title={movie.title}>{movie.title}</h2><time dateTime={movie.releaseDate}>{releaseDate}</time><div className="poster-card-genres">{(movie.genre || []).slice(0, 2).map((genre) => <span key={genre}>{genre}</span>)}</div></div>
    </Link>
  );
}
