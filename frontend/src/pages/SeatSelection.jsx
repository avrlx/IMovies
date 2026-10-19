import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { formatIndianCurrency, formatIndianShowtime } from '../utils/formatters.js';

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  const refreshSeats = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const [showResult, seatResult] = await Promise.all([
        apiRequest(`/shows/${showId}`),
        apiRequest(`/bookings/shows/${showId}/seats`),
      ]);
      setShow(showResult.show);
      setSeats(seatResult.seats || []);
      setSelected((current) => current.filter((seatId) => (seatResult.seats || []).some((seat) => seat._id === seatId && seat.availability === 'available')));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (initial) setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    refreshSeats(true);
    const timer = window.setInterval(() => refreshSeats(false), 8000);
    return () => window.clearInterval(timer);
  }, [refreshSeats]);

  const groupedSeats = useMemo(() => seats.reduce((groups, seat) => {
    const row = seat.row || '?';
    (groups[row] ||= []).push(seat);
    return groups;
  }, {}), [seats]);

  const selectedSeats = seats.filter((seat) => selected.includes(seat._id));
  const total = selectedSeats.reduce((sum, seat) => sum + Number(show?.ticketPrice || 0), 0);

  function toggleSeat(seat) {
    if (seat.availability !== 'available') return;
    setSelected((current) => current.includes(seat._id) ? current.filter((id) => id !== seat._id) : [...current, seat._id]);
  }

  async function reserveSeats() {
    if (!selected.length) return;
    setReserving(true);
    setError('');
    try {
      const { booking } = await apiRequest('/bookings', { method: 'POST', body: { showId, seatIds: selected } });
      navigate(`/checkout/${booking._id}`);
    } catch (requestError) {
      setError(requestError.message);
      await refreshSeats(false);
    } finally {
      setReserving(false);
    }
  }

  if (loading) return <div className="state-panel"><span className="spinner" />Loading the seat map…</div>;
  if (!show) return <div className="state-panel"><h1>Couldn’t load this show</h1><p>{error || 'Try another screening.'}</p><Link className="button button-primary" to="/movies">Browse movies</Link></div>;

  return <div className="page-wrap seat-page">
    <div className="page-kicker"><Link to={`/movie/${show.movie?._id}`}>← Back to movie</Link><span>Seat selection</span></div>
    <div className="section-heading"><div><p className="eyebrow">{show.theatre?.name}</p><h1>Pick your seats.</h1><p className="muted">{show.movie?.title} · {formatIndianShowtime(show.date, show.startTime, { weekday: 'short' })}</p></div><div className="screen-label">SCREEN</div></div>

    {error && <div className="inline-alert" role="alert">{error}</div>}
    {!seats.length ? <div className="empty-panel"><span className="empty-icon">▦</span><h3>No seat layout has been configured</h3><p>This theatre screen needs seats added before reservations can be made.</p></div> : <div className="seat-layout">
      <section className="seat-map-panel">
        <div className="screen-curve"><span>SCREEN</span></div>
        <div className="seat-rows">{Object.entries(groupedSeats).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([row, rowSeats]) => <div className="seat-row" key={row}>
          <span className="row-label">{row}</span>
          <div className="seat-row-buttons">{rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })).map((seat) => <button key={seat._id} type="button" aria-label={`${seat.seatNumber}, ${seat.availability}`} aria-pressed={selected.includes(seat._id)} disabled={seat.availability !== 'available'} className={`seat-button seat-${seat.availability}${seat.type !== 'regular' ? ' seat-premium' : ''}${selected.includes(seat._id) ? ' seat-selected' : ''}`} onClick={() => toggleSeat(seat)}>{seat.seatNumber}</button>)}</div>
        </div>)}</div>
        <div className="seat-legend"><span><i className="legend-dot available" />Available</span><span><i className="legend-dot selected" />Selected</span><span><i className="legend-dot occupied" />Taken</span></div>
        <p className="seat-refresh-note">Seat availability refreshes every few seconds.</p>
      </section>
      <aside className="booking-summary">
        <p className="eyebrow">Your reservation</p><h2>Booking summary</h2>
        <div className="summary-line"><span>Selected seats</span><strong>{selectedSeats.length || '—'}</strong></div>
        <p className="selected-seat-label">{selectedSeats.length ? selectedSeats.map((seat) => seat.seatNumber).join(', ') : 'Choose seats to continue'}</p>
        <div className="summary-line"><span>Price per seat</span><strong>{formatIndianCurrency(show.ticketPrice)}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{formatIndianCurrency(total)}</strong></div>
        <button className="button button-primary button-full" type="button" disabled={!selected.length || reserving} onClick={reserveSeats}>{reserving ? 'Holding seats…' : 'Hold seats & continue'}</button>
        <p className="hold-note">Seats are held for 10 minutes. Payment is not yet enabled.</p>
      </aside>
    </div>}
  </div>;
}
