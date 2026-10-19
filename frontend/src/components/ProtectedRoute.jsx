import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="page-message">Loading your account…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return role && user.role !== role ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
