import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await (isRegister ? register(form) : login({ email: form.email, password: form.password }));
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return <section className="auth-wrap"><div className="auth-card">
    <p className="eyebrow">{isRegister ? 'Join iMovies' : 'Welcome back'}</p>
    <h1>{isRegister ? 'Your next movie night starts here.' : 'Pick up where you left off.'}</h1>
    <p className="auth-subtitle">{isRegister ? 'Create an account to save your plans and reserve seats.' : 'Sign in to manage reservations and discover what’s showing.'}</p>
    <form onSubmit={submit}>
      {isRegister && <label>Your name<input autoComplete="name" required minLength="2" maxLength="80" placeholder="Aviral Singh" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}
      <label>Email address<input autoComplete="email" required type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Password<div className="password-input"><input autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength="6" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary button-full" type="submit">{isRegister ? 'Create account' : 'Sign in'} <span>→</span></button>
    </form>
    <p className="form-switch">{isRegister ? 'Already registered?' : 'New to iMovies?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
  </div><aside className="auth-aside"><span className="auth-aside-mark">◈</span><p>Find the room.<br />Find the story.<br /><em>Feel everything.</em></p></aside></section>;
}
