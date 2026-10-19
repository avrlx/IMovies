import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client.js';

function dateInputValue(daysFromNow = 1) {
  const date = new Date(); date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function AdminShows() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [theatreForm, setTheatreForm] = useState({ name: '', location: '', address: '', screenName: 'Screen 1', capacity: '80' });
  const [showForm, setShowForm] = useState({ movie: '', theatre: '', screen: '', date: dateInputValue(), startTime: '18:00', endTime: '20:00', ticketPrice: '250' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [movieResult, theatreResult, showResult, bookingResult] = await Promise.all([apiRequest('/movies'), apiRequest('/theatres'), apiRequest('/shows'), apiRequest('/bookings')]);
      setMovies(movieResult.movies || []); setTheatres(theatreResult.theatres || []); setShows(showResult.shows || []); setBookings(bookingResult.bookings || []); setError('');
      setShowForm((current) => {
        const theatre = (theatreResult.theatres || []).find((item) => item._id === current.theatre) || (theatreResult.theatres || [])[0];
        const movie = (movieResult.movies || []).find((item) => item._id === current.movie) || (movieResult.movies || [])[0];
        return { ...current, movie: movie?._id || '', theatre: theatre?._id || '', screen: theatre?.screens?.[0]?._id || '' };
      });
    } catch (requestError) { setError(requestError.message); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const selectedTheatre = theatres.find((theatre) => theatre._id === showForm.theatre);

  async function createTheatre(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await apiRequest('/theatres', { method: 'POST', body: { name: theatreForm.name.trim(), location: theatreForm.location.trim(), address: theatreForm.address.trim(), screens: [{ name: theatreForm.screenName.trim(), capacity: Number(theatreForm.capacity) }] } });
      setTheatreForm({ name: '', location: '', address: '', screenName: 'Screen 1', capacity: '80' });
      setNotice('Theatre created and its seat inventory is ready.'); await loadData();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function createShow(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await apiRequest('/shows', { method: 'POST', body: { movie: showForm.movie, theatre: showForm.theatre, screen: showForm.screen, date: new Date(`${showForm.date}T00:00:00.000Z`).toISOString(), startTime: showForm.startTime, endTime: showForm.endTime, ticketPrice: Number(showForm.ticketPrice) } });
      setNotice('Showtime created. It is now visible on the movie page.'); await loadData();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function removeShow(showId) {
    try { await apiRequest(`/shows/${showId}`, { method: 'DELETE' }); await loadData(); }
    catch (requestError) { setError(requestError.message); }
  }

  return <div className="page-wrap admin-page">
    <div className="page-kicker"><Link to="/dashboard">← Dashboard</Link><span>Admin · Screenings</span></div>
    <div className="section-heading"><div><p className="eyebrow">Set the schedule</p><h1>Theatres & shows.</h1><p className="muted">Create a theatre first; its screen capacity generates a seat map automatically.</p></div></div>
    {error && <div className="inline-alert" role="alert">{error}</div>}{notice && <div className="inline-success" role="status">{notice}</div>}
    <div className="admin-forms-grid">
      <form className="admin-form" onSubmit={createTheatre}><p className="eyebrow">Step 1</p><h2>Add a theatre</h2>
        <label>Theatre name<input required value={theatreForm.name} onChange={(event) => setTheatreForm({ ...theatreForm, name: event.target.value })} /></label>
        <div className="form-grid"><label>City / area<input required value={theatreForm.location} onChange={(event) => setTheatreForm({ ...theatreForm, location: event.target.value })} /></label><label>Screen name<input required value={theatreForm.screenName} onChange={(event) => setTheatreForm({ ...theatreForm, screenName: event.target.value })} /></label></div>
        <label>Address<input required value={theatreForm.address} onChange={(event) => setTheatreForm({ ...theatreForm, address: event.target.value })} /></label>
        <label>Seats in screen<input required type="number" min="1" max="300" value={theatreForm.capacity} onChange={(event) => setTheatreForm({ ...theatreForm, capacity: event.target.value })} /></label>
        <button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Create theatre & seats'}</button>
      </form>
      <form className="admin-form" onSubmit={createShow}><p className="eyebrow">Step 2</p><h2>Schedule a show</h2>
        <label>Movie<select required value={showForm.movie} onChange={(event) => setShowForm({ ...showForm, movie: event.target.value })}><option value="">Select a movie</option>{movies.map((movie) => <option value={movie._id} key={movie._id}>{movie.title}</option>)}</select></label>
        <label>Theatre<select required value={showForm.theatre} onChange={(event) => { const theatre = theatres.find((item) => item._id === event.target.value); setShowForm({ ...showForm, theatre: event.target.value, screen: theatre?.screens?.[0]?._id || '' }); }}><option value="">Select a theatre</option>{theatres.map((theatre) => <option value={theatre._id} key={theatre._id}>{theatre.name} · {theatre.location}</option>)}</select></label>
        <label>Screen<select required value={showForm.screen} onChange={(event) => setShowForm({ ...showForm, screen: event.target.value })}><option value="">Select a screen</option>{selectedTheatre?.screens?.map((screen) => <option key={screen._id} value={screen._id}>{screen.name} · {screen.capacity} seats</option>)}</select></label>
        <div className="form-grid"><label>Date<input required type="date" min={dateInputValue(0)} value={showForm.date} onChange={(event) => setShowForm({ ...showForm, date: event.target.value })} /></label><label>Ticket price<input required type="number" min="0" value={showForm.ticketPrice} onChange={(event) => setShowForm({ ...showForm, ticketPrice: event.target.value })} /></label></div>
        <div className="form-grid"><label>Starts<input required type="time" value={showForm.startTime} onChange={(event) => setShowForm({ ...showForm, startTime: event.target.value })} /></label><label>Ends<input required type="time" value={showForm.endTime} onChange={(event) => setShowForm({ ...showForm, endTime: event.target.value })} /></label></div>
        <button className="button button-primary" disabled={saving || !movies.length || !theatres.length}>{saving ? 'Saving…' : 'Publish showtime'}</button>
      </form>
    </div>
    <section className="admin-list admin-show-list"><div className="section-heading"><div><p className="eyebrow">On the schedule</p><h2>{shows.length} showtime{shows.length === 1 ? '' : 's'}</h2></div></div>
      {shows.map((show) => <article className="admin-row" key={show._id}><div className="admin-row-main"><h3>{show.movie?.title || 'Movie'} · {show.theatre?.name || 'Theatre'}</h3><p>{new Date(show.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {show.startTime}–{show.endTime} · ₹{show.ticketPrice}</p></div><button className="text-button danger-text" type="button" onClick={() => removeShow(show._id)}>Remove</button></article>)}
      {!shows.length && <div className="empty-panel"><h3>No showtimes scheduled</h3><p>Create a screening using the form above.</p></div>}
    </section>
    <section className="admin-list admin-show-list"><div className="section-heading"><div><p className="eyebrow">Reservation overview</p><h2>All bookings</h2><p className="muted">{bookings.length} reservation{bookings.length === 1 ? '' : 's'} across the cinema.</p></div></div>
      {bookings.length ? <div className="admin-booking-list">{bookings.map((booking) => <article className="admin-row admin-booking-row" key={booking._id}><div className="admin-row-main"><h3>{booking.show?.movie?.title || 'Movie reservation'} · {booking.user?.name || booking.user?.email || 'Customer'}</h3><p>{booking.show?.theatre?.name || 'Cinema'} · {new Date(booking.show?.date || booking.bookingTimestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {booking.show?.startTime || 'Time unavailable'}</p><small>{booking.selectedSeats?.map((seat) => seat.seatNumber).join(', ') || 'No seats'} · ₹{Number(booking.amount || 0).toLocaleString('en-IN')}</small></div><span className={`status-pill status-${booking.bookingStatus}`}>{booking.bookingStatus}</span></article>)}</div> : <div className="empty-panel"><h3>No bookings yet</h3><p>Reservations will appear here once customers select seats.</p></div>}
    </section>
  </div>;
}
