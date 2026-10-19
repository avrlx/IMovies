import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import MovieCard from '../components/MovieCard.jsx';

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    language: searchParams.get('language') || '',
    status: searchParams.get('status') || 'now_showing',
    minRating: searchParams.get('minRating') || '',
  });

  useEffect(() => {
    setFilters((current) => ({ ...current, search: searchParams.get('search') || '' }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
    setLoading(true); setError('');
    apiRequest(`/movies/real?${query}`)
      .then((result) => { if (active) setMovies(result.movies || []); })
      .catch((requestError) => { if (active) { setMovies([]); setError(requestError.message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    if (key === 'search') {
      const next = new URLSearchParams(searchParams);
      value ? next.set('search', value) : next.delete('search');
      setSearchParams(next, { replace: true });
    }
  }

  return <div className="page-wrap movies-page">
    <section className="movies-heading"><div><p className="eyebrow">The marquee</p><h1>Find your next film.</h1><p className="muted">Browse what’s playing and choose the kind of night you want.</p></div><div className="movie-count">{loading ? '…' : `${movies.length} titles`}</div></section>
    <section className="movie-filters" aria-label="Filter movies">
      <label className="search-filter">Search<input type="search" placeholder="Title or keyword" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} /></label>
      <label>Showing<select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="now_showing">Now showing</option><option value="upcoming">Coming soon</option><option value="ended">Past releases</option><option value="">All movies</option></select></label>
      <label>Genre<select value={filters.genre} onChange={(event) => updateFilter('genre', event.target.value)}><option value="">All genres</option>{['Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'].map((genre) => <option key={genre}>{genre}</option>)}</select></label>
      <label>Language<select value={filters.language} onChange={(event) => updateFilter('language', event.target.value)}><option value="">All languages</option>{['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Malayalam', 'Kannada'].map((language) => <option key={language}>{language}</option>)}</select></label>
      <label>Rating<select value={filters.minRating} onChange={(event) => updateFilter('minRating', event.target.value)}><option value="">Any rating</option><option value="6">6+ stars</option><option value="7">7+ stars</option><option value="8">8+ stars</option></select></label>
    </section>
    {error && <div className="inline-alert" role="alert">{error}</div>}
    {loading ? <div className="state-inline"><span className="spinner" />Loading titles…</div> : movies.length ? <div className="movie-grid-rich">{movies.map((movie) => <MovieCard key={movie._id} movie={movie} />)}</div> : error.includes('TMDB') ? <div className="empty-panel"><span className="empty-icon">◉</span><h2>Connect live movie listings</h2><p>{error}</p><a className="button button-primary" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">Get a TMDB access token</a><p className="muted">Save it as TMDB_ACCESS_TOKEN in backend/.env, then restart the backend.</p></div> : <div className="empty-panel"><span className="empty-icon">⌕</span><h2>No matching movies</h2><p>Try changing a filter or clearing the search.</p><button type="button" className="button button-secondary" onClick={() => { setFilters({ search: '', genre: '', language: '', status: 'now_showing', minRating: '' }); setSearchParams({}); }}>Clear filters</button></div>}
    <aside className="tmdb-attribution"><img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" alt="TMDB" /><p>This product uses the TMDB API but is not endorsed or certified by TMDB. <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">The Movie Database</a> provides movie data and artwork.</p></aside>
  </div>;
}
