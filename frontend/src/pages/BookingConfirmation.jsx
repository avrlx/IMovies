import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { formatIndianCurrency, formatIndianShowtime } from '../utils/formatters.js';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBooking = useCallback(async () => {
    try {
      const result = await apiRequest(`/bookings/${bookingId}`);
      setBooking(result.booking); setPayment(result.payment || null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  useEffect(() => {
    const isConfirmed = booking?.bookingStatus === 'confirmed' && booking?.paymentStatus === 'paid';
    if (!isConfirmed) return undefined;
    const timer = window.setTimeout(() => navigate('/bookings', { replace: true }), 7000);
    return () => window.clearTimeout(timer);
  }, [booking, navigate]);

  if (loading) return <div className="state-panel"><span className="spinner" />Loading reservation…</div>;
  if (!booking) return <div className="state-panel"><h1>Reservation not found</h1><p>{error}</p><Link className="button button-primary" to="/bookings">View bookings</Link></div>;

  const isConfirmed = booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid';
  const isCancelled = booking.bookingStatus === 'cancelled';
  const seatLabels = (booking.selectedSeats || []).map((seat) => seat.seatNumber).join(', ');

  function downloadReceipt() {
    const text = [
      'IMOVIES PAYMENT RECEIPT',
      `Receipt: #${booking._id.slice(-8).toUpperCase()}`,
      `Transaction: ${payment?.transactionId || '—'}`,
      `Movie: ${booking.show?.movie?.title || 'Movie'}`,
      `Theatre: ${booking.show?.theatre?.name || 'Cinema'}`,
      `Showtime: ${formatIndianShowtime(booking.show?.date, booking.show?.startTime)}`,
      `Seats: ${seatLabels || '—'}`,
      `Paid: ${formatIndianCurrency(booking.amount)}`,
      `Payment method: ${payment?.paymentMethod?.replace('_', ' ') || '—'}`,
      `Issued: ${new Date().toLocaleString('en-IN')}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url; link.download = `imovies-receipt-${booking._id.slice(-8)}.txt`; link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="page-wrap confirmation-page">
    <section className="confirmation-card">
      <div className={`confirmation-mark ${isConfirmed ? 'is-success' : isCancelled ? 'is-cancelled' : ''}`}>{isConfirmed ? '✓' : isCancelled ? '×' : '◷'}</div>
      <p className="eyebrow">{isConfirmed ? 'You’re all set' : isCancelled ? 'Reservation cancelled' : 'Seats held temporarily'}</p>
      <h1>{isConfirmed ? 'Booking confirmed.' : isCancelled ? 'Your hold was released.' : 'Your reservation is waiting.'}</h1>
      <p className="confirmation-copy">{isConfirmed ? 'Payment is complete. You will be taken to My Bookings in a few seconds.' : isCancelled ? 'Those seats are available for other moviegoers.' : 'Complete payment to turn this temporary reservation into a confirmed ticket.'}</p>
      <div className="reservation-ticket">
        <div><span>Movie</span><strong>{booking.show?.movie?.title || 'Movie'}</strong></div>
        <div><span>Theatre</span><strong>{booking.show?.theatre?.name || 'Cinema'}</strong></div>
        <div><span>Showtime</span><strong>{formatIndianShowtime(booking.show?.date, booking.show?.startTime, { weekday: 'short' })}</strong></div>
        <div><span>Seats</span><strong>{seatLabels || '—'}</strong></div>
        <div><span>Reservation</span><strong>#{booking._id.slice(-8).toUpperCase()}</strong></div>
        <div><span>{isConfirmed ? 'Amount paid' : 'Amount due'}</span><strong>{formatIndianCurrency(booking.amount)}</strong></div>
        {isConfirmed && <div><span>Transaction</span><strong>{payment?.transactionId || 'Processing'}</strong></div>}
      </div>
      {booking.holdExpiresAt && booking.bookingStatus === 'pending' && <p className="hold-note">Seat hold expires {new Date(booking.holdExpiresAt).toLocaleString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}.</p>}
      <div className="confirmation-actions">{isConfirmed && <><button className="button button-primary" type="button" onClick={downloadReceipt}>Download receipt</button><button className="button button-secondary" type="button" onClick={() => window.print()}>Print receipt</button></>}<Link className="button button-secondary" to="/bookings">View my bookings</Link><Link className="button button-secondary" to="/movies">Browse movies</Link></div>
    </section>
  </div>;
}
