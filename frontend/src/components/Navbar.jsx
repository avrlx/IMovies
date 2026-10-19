import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/movies?search=${encodeURIComponent(query)}` : '/movies');
  }

  return <header className="site-header">
    <Link className="brand" to="/">IMovies</Link>
    <nav className="main-nav" aria-label="Main navigation">
      <NavLink to="/movies">Movies</NavLink>
      {user && <NavLink to="/bookings">My bookings</NavLink>}
      {user?.role === 'admin' && <NavLink to="/admin/movies">Admin</NavLink>}
    </nav>
    <form className="nav-search" role="search" onSubmit={submitSearch}><input aria-label="Search movies" placeholder="Search movies" value={search} onChange={(event) => setSearch(event.target.value)} /><button aria-label="Submit search" type="submit">⌕</button></form>
    <div className="nav-account">
      {user ? <><Link className="nav-profile" to="/profile">{user.name?.split(' ')[0] || 'Account'}</Link><button className="nav-signout" type="button" onClick={() => { logout(); navigate('/'); }}>Sign out</button></> : <><Link className="nav-signin" to="/login">Sign in</Link><Link className="button button-primary nav-register" to="/register">Join</Link></>}
    </div>
  </header>;
}
