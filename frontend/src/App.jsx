import { Link, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';
import Movies from './pages/Movies.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import Profile from './pages/Profile.jsx';
import Bookings from './pages/Bookings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminMovies from './pages/AdminMovies.jsx';
import AdminShows from './pages/AdminShows.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:movieId" element={<MovieDetails />} />
          <Route path="/book/:movieId" element={<MovieDetails />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/seats/:showId" element={<SeatSelection />} />
            <Route path="/checkout/:bookingId" element={<Checkout />} />
            <Route path="/payment/:bookingId" element={<Payment />} />
            <Route path="/confirmation/:bookingId" element={<BookingConfirmation />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/shows" element={<AdminShows />} />
          </Route>
          <Route path="*" element={<div className="state-panel"><h1>That page isn’t here.</h1><Link className="button button-primary" to="/">Back home</Link></div>} />
        </Routes>
      </main>
    </div>
  );
}

