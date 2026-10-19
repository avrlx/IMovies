import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client.js';

const emptyForm = { title: '', description: '', genre: '', language: '', duration: '', releaseDate: '', poster: '', rating: '', status: 'now_showing', cast: '' };

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const loadMovies = useCallback(async () => {
    try { const result = await apiRequest('/movies'); setMovies(result.movies || []); setError(''); }
    catch (requestError) { setError(requestError.message); }
  }, []);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError(''); setNotice('');
    try {
      await apiRequest('/movies', { method: 'POST', body: {
        title: form.title.trim(), description: form.description.trim(),
        genre: form.genre.split(',').map((value) => value.trim()).filter(Boolean),
        language: form.language.trim(), duration: Number(form.duration), releaseDate: form.releaseDate,
        poster: form.poster.trim(), rating: form.rating === '' ? 0 : Number(form.rating), status: form.status,
        cast: form.cast.split(',').map((value) => value.trim()).filter(Boolean),
      } });
      setForm(emptyForm); setNotice('Movie added. It is now available in the catalogue.'); await loadMovies();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function removeMovie(movieId) {
    if (!window.confirm('Remove this movie from the catalogue?')) return;
    try { await apiRequest(`/movies/${movieId}`, { method: 'DELETE' }); await loadMovies(); }
    catch (requestError) { setError(requestError.message); }
  }

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  return <div className="page-wrap admin-page">
    <div className="page-kicker"><Link to="/dashboard">← Dashboard</Link><span>Admin · Catalogue</span></div>
    <div className="section-heading"><div><p className="eyebrow">Manage the marquee</p><h1>Movies.</h1><p className="muted">Add titles to the catalogue or remove outdated listings.</p></div></div>
    {error && <div className="inline-alert" role="alert">{error}</div>}{notice && <div className="inline-success" role="status">{notice}</div>}
    <div className="admin-layout">
      <form className="admin-form" onSubmit={submit}>
        <p className="eyebrow">New listing</p><h2>Add a movie</h2>
        <label>Title<input required minLength="2" maxLength="200" value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
        <label>Description<textarea required minLength="10" value={form.description} onChange={(event) => update('description', event.target.value)} rows="4" /></label>
        <div className="form-grid"><label>Genre<input required placeholder="Drama, Thriller" value={form.genre} onChange={(event) => update('genre', event.target.value)} /></label><label>Language<input required value={form.language} onChange={(event) => update('language', event.target.value)} /></label></div>
        <div className="form-grid"><label>Duration (minutes)<input required type="number" min="1" value={form.duration} onChange={(event) => update('duration', event.target.value)} /></label><label>Release date<input required type="date" value={form.releaseDate} onChange={(event) => update('releaseDate', event.target.value)} /></label></div>
        <div className="form-grid"><label>Rating (0–10)<input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(event) => update('rating', event.target.value)} /></label><label>Status<select value={form.status} onChange={(event) => update('status', event.target.value)}><option value="now_showing">Now showing</option><option value="upcoming">Upcoming</option><option value="ended">Ended</option></select></label></div>
        <label>Cast <span className="field-hint">Separate names with commas</span><input value={form.cast} onChange={(event) => update('cast', event.target.value)} /></label>
        <label>Poster image URL<input type="url" value={form.poster} onChange={(event) => update('poster', event.target.value)} /></label>
        <button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Add movie'}</button>
      </form>
      <section className="admin-list"><div className="section-heading"><div><p className="eyebrow">Current catalogue</p><h2>{movies.length} movie{movies.length === 1 ? '' : 's'}</h2></div></div>
        {movies.map((movie) => <article className="admin-row" key={movie._id}><div className="admin-row-poster">{movie.poster ? <img src={movie.poster} alt="" /> : '◈'}</div><div className="admin-row-main"><h3>{movie.title}</h3><p>{movie.language} · {movie.duration} min · {movie.genre?.join(', ')}</p><small>{movie.status?.replaceAll('_', ' ')}</small></div><button className="text-button danger-text" type="button" onClick={() => removeMovie(movie._id)}>Remove</button></article>)}
        {!movies.length && <div className="empty-panel"><h3>No movies added yet</h3><p>Add the first title using the form.</p></div>}
      </section>
    </div>
  </div>;
}
