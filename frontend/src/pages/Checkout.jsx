import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { formatIndianCurrency, formatIndianShowtime, formatIndianTime } from '../utils/formatters.js';

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadBooking = useCallback(async () => {
    try {
      const result = await apiRequest(`/bookings/${bookingId}`);
      setBooking(result.booking);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  async function cancelHold() {
    setCancelling(true);
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
      navigate('/bookings');
    } catch (requestError) {
      setError(requestError.message);
      setCancelling(false);
    }
  }

  if (loading) return <div className="state-panel"><span className="spinner" />Loading your reservation…</div>;
  if (!booking) return <div className="state-panel"><h1>Reservation unavailable</h1><p>{error}</p><Link className="button button-primary" to="/movies">Browse movies</Link></div>;

  const expired = booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= new Date();
  const seats = booking.selectedSeats || [];
  return <div className="page-wrap checkout-page">
    <div className="page-kicker"><Link to={`/seats/${booking.show?._id}`}>← Change seats</Link><span>Review reservation</span></div>
    <div className="checkout-grid">
      <section className="checkout-main">
        <p className="eyebrow">Almost there</p><h1>Review your seats.</h1>
        <div className="checkout-movie">
          <div className="checkout-poster">{booking.show?.movie?.poster ? <img src={booking.show.movie.poster} alt="" /> : <span>◈</span>}</div>
          <div><h2>{booking.show?.movie?.title || 'Movie screening'}</h2><p>{booking.show?.theatre?.name} · {booking.show?.theatre?.location}</p><p>{formatIndianShowtime(booking.show?.date, booking.show?.startTime, { weekday: 'long' })}</p></div>
        </div>
        <div className="checkout-block"><div className="section-heading"><h2>Seats</h2><span>{seats.length} ticket{seats.length === 1 ? '' : 's'}</span></div><div className="seat-chips">{seats.map((seat) => <span key={seat._id}>{seat.row}{seat.seatNumber}</span>)}</div></div>
        <div className="payment-notice"><span>◷</span><div><strong>Complete payment to confirm your ticket</strong><p>Your selected seats are held for 10 minutes. Choose a payment method on the next screen to finish this reservation.</p></div></div>
        {error && <div className="inline-alert" role="alert">{error}</div>}
        <div className="checkout-actions">{booking.bookingStatus === 'pending' && !expired && <Link className="button button-primary" to={`/payment/${booking._id}`}>Proceed to payment</Link>}{booking.bookingStatus === 'confirmed' && <Link className="button button-primary" to={`/confirmation/${booking._id}`}>View ticket</Link>}{booking.bookingStatus === 'pending' && <button className="button button-secondary" type="button" disabled={cancelling} onClick={cancelHold}>{cancelling ? 'Releasing seats…' : 'Cancel reservation'}</button>}</div>
      </section>
      <aside className="booking-summary checkout-total"><p className="eyebrow">Summary</p><h2>Reservation total</h2><div className="summary-line"><span>{seats.length} × seat</span><strong>{formatIndianCurrency(booking.show?.ticketPrice)}</strong></div><div className="summary-total"><span>Total due</span><strong>{formatIndianCurrency(booking.amount)}</strong></div><p className={`booking-status ${expired ? 'status-expired' : ''}`}>{expired ? 'Seat hold expired' : `Payment ${booking.paymentStatus}`}</p>{booking.holdExpiresAt && !expired && <p className="hold-note">Hold expires {formatIndianTime(new Date(booking.holdExpiresAt).toTimeString().slice(0, 5))}</p>}</aside>
    </div>
  </div>;
}
