import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="page-wrap profile-page">
    <p className="eyebrow">Your account</p><h1>Profile.</h1>
    <section className="profile-card">
      <div className="profile-avatar">{user?.name?.trim()?.[0]?.toUpperCase() || 'U'}</div>
      <div className="profile-details"><p className="eyebrow">{user?.role === 'admin' ? 'Administrator' : 'iMovies member'}</p><h2>{user?.name}</h2><p>{user?.email}</p>{user?.phone && <p>{user.phone}</p>}</div>
      <Link className="button button-secondary" to="/bookings">My bookings</Link>
      <button className="button button-quiet" type="button" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
    </section>
    <div className="profile-note"><span>✦</span><p>Your account details are managed securely. Profile editing and saved payment methods will be available in a later update.</p></div>
  </div>;
}
