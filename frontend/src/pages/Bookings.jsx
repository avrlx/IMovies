import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { formatIndianCurrency, formatIndianShowtime } from '../utils/formatters.js';

const tabs = ['upcoming', 'past', 'cancelled'];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadBookings = useCallback(async () => {
    try {
      const result = await apiRequest('/bookings/mine');
      setBookings(result.bookings || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    if (activeTab === 'cancelled') return booking.bookingStatus === 'cancelled';
    if (booking.bookingStatus === 'cancelled') return false;
    const showDate = new Date(booking.show?.date || booking.bookingTimestamp);
    const isPast = showDate < new Date(new Date().setHours(0, 0, 0, 0));
    return activeTab === 'past' ? isPast : !isPast;
  }), [activeTab, bookings]);

  async function cancelBooking(bookingId) {
    setBusyId(bookingId);
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
      await loadBookings();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  if (loading) return <div className="state-panel"><span className="spinner" />Loading your bookings…</div>;
  return <div className="page-wrap bookings-page">
    <div className="section-heading"><div><p className="eyebrow">Your tickets</p><h1>My bookings.</h1></div><Link className="button button-primary" to="/movies">Find a movie</Link></div>
    {error && <div className="inline-alert" role="alert">{error}</div>}
    <div className="booking-tabs" role="tablist">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={`booking-tab ${activeTab === tab ? 'is-active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}<span>{bookings.filter((booking) => tab === 'cancelled' ? booking.bookingStatus === 'cancelled' : booking.bookingStatus !== 'cancelled' && ((new Date(booking.show?.date || booking.bookingTimestamp) < new Date(new Date().setHours(0, 0, 0, 0))) === (tab === 'past'))).length}</span></button>)}</div>
    {filteredBookings.length ? <div className="booking-list">{filteredBookings.map((booking) => {
      const show = booking.show || {};
      const seats = (booking.selectedSeats || []).map((seat) => seat.seatNumber).join(', ');
      return <article className="booking-card" key={booking._id}>
        <div className="booking-card-poster">{show.movie?.poster ? <img src={show.movie.poster} alt="" /> : <span>◈</span>}</div>
        <div className="booking-card-body"><div className="booking-card-head"><div><p className="eyebrow">{show.theatre?.name || 'Cinema'}</p><h2>{show.movie?.title || 'Movie reservation'}</h2></div><span className={`status-pill status-${booking.bookingStatus}`}>{booking.bookingStatus} · payment {booking.paymentStatus}</span></div>
          <div className="booking-details"><span>{formatIndianShowtime(show.date || booking.bookingTimestamp, show.startTime, { weekday: 'short' })}</span><span>Seats {seats || '—'}</span><strong>{formatIndianCurrency(booking.amount)}</strong></div>
          <div className="booking-card-actions"><Link className="text-link" to={`/confirmation/${booking._id}`}>Reservation details →</Link>{booking.bookingStatus === 'pending' && <button className="text-button danger-text" type="button" disabled={busyId === booking._id} onClick={() => cancelBooking(booking._id)}>{busyId === booking._id ? 'Releasing…' : 'Cancel hold'}</button>}</div>
        </div>
      </article>;
    })}</div> : <div className="empty-panel"><span className="empty-icon">▣</span><h2>{activeTab === 'upcoming' ? 'No upcoming plans yet' : activeTab === 'past' ? 'No past bookings' : 'No cancelled reservations'}</h2><p>{activeTab === 'upcoming' ? 'Pick a movie and your reservation will show up here.' : 'There’s nothing to show in this section.'}</p>{activeTab === 'upcoming' && <Link className="button button-primary" to="/movies">Browse movies</Link>}</div>}
  </div>;
}
