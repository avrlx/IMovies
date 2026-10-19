import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  return <section className="dashboard-page">
    <p className="eyebrow">{isAdmin ? 'Admin console' : 'Your iMovies'}</p>
    <h1>{isAdmin ? 'Manage the cinema experience.' : 'Your movie journey.'}</h1>
    <div className="dashboard-grid">
      <Link className="dashboard-tile" to="/profile"><strong>Profile</strong><span>Manage your account details</span></Link>
      <Link className="dashboard-tile" to="/movies"><strong>Browse movies</strong><span>Explore available titles and shows</span></Link>
      {isAdmin && <><Link className="dashboard-tile" to="/admin/movies"><strong>Manage movies</strong><span>Create and update listings</span></Link><Link className="dashboard-tile" to="/admin/shows"><strong>Manage shows</strong><span>Manage theatres and schedules</span></Link></>}
    </div>
  </section>;
}
