import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/movies/real?status=now_showing&limit=8')
      .then((res) => { if (active) setMovies(res.movies || []); })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBackdrop} />
        <div style={styles.heroContent}>
          <p style={styles.eyebrow}>Your cinema, reimagined</p>
          <h1 style={styles.heroTitle}>
            Tonight deserves a <em style={styles.emphasis}>great</em> story.
          </h1>
          <p style={styles.heroDesc}>
            Discover unforgettable movies, find the perfect showtime, and make your next night out feel effortless.
          </p>
          <div style={styles.heroCta}>
            <Link to="/movies" style={styles.btnPrimary}>
              Explore movies →
            </Link>
            <Link to="/register" style={styles.btnSecondary}>
              Join iMovies
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      {(movies.length > 0 || loading || loadError) && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Now showing</h2>
          {loading && <p className="muted">Finding what’s on…</p>}
          {loadError && <p className="form-error" role="alert">{loadError}</p>}
          {!!movies.length && <div className="movie-grid-rich">
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>}
          {!loading && !loadError && !movies.length && <p className="muted">No movies are listed yet. Check back soon.</p>}
          {movies.length > 0 && <Link className="text-link" to="/movies">See all movies →</Link>}
        </section>
      )}

      {/* Why IMovies */}
      <section style={styles.features}>
        <div style={styles.featureItem}>
          <div style={styles.featureNumber}>01</div>
          <h3 style={styles.featureTitle}>Find your film</h3>
          <p style={styles.featureDesc}>Browse stories curated for every mood.</p>
        </div>
        <div style={styles.featureItem}>
          <div style={styles.featureNumber}>02</div>
          <h3 style={styles.featureTitle}>Choose your moment</h3>
          <p style={styles.featureDesc}>Compare theatres and showtimes in one place.</p>
        </div>
        <div style={styles.featureItem}>
          <div style={styles.featureNumber}>03</div>
          <h3 style={styles.featureTitle}>Make it yours</h3>
          <p style={styles.featureDesc}>Reserve seats and keep every plan together.</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh' },
  hero: {
    minHeight: '70vh',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--sp-12) var(--sp-6)',
  },
  heroBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'url(https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1200) center/cover',
    opacity: 0.15,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '600px',
  },
  eyebrow: {
    color: 'var(--accent-warning)',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: 'var(--sp-2)',
  },
  heroTitle: {
    fontSize: 'clamp(32px, 8vw, 56px)',
    lineHeight: '1.1',
    marginBottom: 'var(--sp-4)',
    fontWeight: '700',
  },
  emphasis: {
    color: 'var(--accent-primary)',
    fontStyle: 'italic',
  },
  heroDesc: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--sp-6)',
    lineHeight: '1.6',
  },
  heroCta: {
    display: 'flex',
    gap: 'var(--sp-4)',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: 'var(--accent-primary)',
    color: 'var(--bg-primary)',
    padding: 'var(--sp-3) var(--sp-6)',
    borderRadius: 'var(--radius-lg)',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all var(--transition-base)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  btnSecondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    padding: 'var(--sp-3) var(--sp-6)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-medium)',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all var(--transition-base)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  section: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: 'var(--sp-12) var(--sp-6)',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: 'var(--sp-8)',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--sp-8)',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: 'var(--sp-12) var(--sp-6)',
    borderTop: '1px solid var(--border-light)',
  },
  featureItem: {
    padding: 'var(--sp-6)',
  },
  featureNumber: {
    fontSize: '48px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    marginBottom: 'var(--sp-2)',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: 'var(--sp-2)',
  },
  featureDesc: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
};
