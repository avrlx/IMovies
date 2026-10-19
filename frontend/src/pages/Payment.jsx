import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { formatIndianCurrency, formatIndianTime } from '../utils/formatters.js';

const paymentMethods = [
  { value: 'upi', label: 'UPI', detail: 'Pay using any UPI app' },
  { value: 'card', label: 'Card', detail: 'Credit or debit card' },
  { value: 'net_banking', label: 'Net banking', detail: 'Pay from your bank account' },
  { value: 'wallet', label: 'Wallet', detail: 'Use a saved wallet balance' },
];

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

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

  async function pay(event) {
    event.preventDefault();
    setPaying(true); setError('');
    try {
      await apiRequest(`/bookings/${bookingId}/pay`, { method: 'POST', body: { paymentMethod: method } });
      navigate(`/confirmation/${bookingId}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div className="state-panel"><span className="spinner" />Loading payment…</div>;
  if (!booking) return <div className="state-panel"><h1>Payment unavailable</h1><p>{error}</p><Link className="button button-primary" to="/bookings">View bookings</Link></div>;
  const expired = booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= new Date();
  if (booking.bookingStatus === 'confirmed') return <Navigate to={`/confirmation/${bookingId}`} replace />;

  return <div className="page-wrap payment-page"><div className="page-kicker"><Link to={`/checkout/${bookingId}`}>← Back to reservation</Link><span>Secure checkout</span></div><div className="payment-layout"><form className="payment-card" onSubmit={pay}><p className="eyebrow">Payment method</p><h1>Complete your booking.</h1><p className="muted">This demo checkout records a successful payment without collecting real payment details.</p><div className="payment-methods">{paymentMethods.map((item) => <label className={`payment-method ${method === item.value ? 'is-selected' : ''}`} key={item.value}><input type="radio" name="paymentMethod" value={item.value} checked={method === item.value} onChange={() => setMethod(item.value)} /><span><strong>{item.label}</strong><small>{item.detail}</small></span></label>)}</div>{error && <div className="inline-alert" role="alert">{error}</div>}<button className="button button-primary button-full" type="submit" disabled={paying || expired}>{paying ? 'Processing payment…' : `Pay ${formatIndianCurrency(booking.amount)}`}</button>{expired && <p className="form-error">This hold has expired. Please choose your seats again.</p>}</form><aside className="booking-summary"><p className="eyebrow">Order summary</p><h2>{booking.show?.movie?.title || 'Movie screening'}</h2><div className="summary-line"><span>Seats</span><strong>{booking.selectedSeats?.map((seat) => seat.seatNumber).join(', ') || '—'}</strong></div><div className="summary-line"><span>Showtime</span><strong>{formatIndianTime(booking.show?.startTime)}</strong></div><div className="summary-total"><span>Total</span><strong>{formatIndianCurrency(booking.amount)}</strong></div></aside></div></div>;
}
