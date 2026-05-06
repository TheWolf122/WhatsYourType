import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../hooks/useSession.js';
import { getStats } from '../utils/api.js';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const { sessionId, createSession, clearSession, loadSession } = useSession();
  const [totalVotes, setTotalVotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pastId, setPastId] = useState('');

  function handleLoadPastSession(e) {
    e.preventDefault();
    const trimmed = pastId.trim();
    if (!trimmed) return;
    loadSession(trimmed);
    navigate(`/results/${trimmed}`);
  }

  useEffect(() => {
    getStats().then(data => setTotalVotes(data.totalVotes)).catch(() => {});
  }, []);

  async function handleStart() {
    setLoading(true);
    await createSession();
    navigate('/vote');
  }

  async function handleNewSession() {
    setLoading(true);
    clearSession();
    await createSession();
    navigate('/vote');
  }

  return (
    <div className={styles.page}>
      <div className={styles.hearts} aria-hidden="true">🩷 💗 🩷</div>
      <h1 className={styles.title}>What's Your Type?</h1>
      <p className={styles.tagline}>Smash, snuggle, or pass — work your way through the Pokédex and find out what your choices say about you.</p>

      {totalVotes !== null && (
        <p className={styles.stats}>{totalVotes.toLocaleString()} votes cast globally</p>
      )}

      <div className={styles.actions}>
        {sessionId ? (
          <>
            <button
              className={styles.primary}
              onClick={() => navigate('/vote')}
              disabled={loading}
            >
              Continue Session
            </button>
            <button
              className={styles.secondary}
              onClick={handleNewSession}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Start New Session'}
            </button>
          </>
        ) : (
          <button
            className={styles.primary}
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Start Voting'}
          </button>
        )}
      </div>

      {sessionId && (
        <div className={styles.sessionLinks}>
          <p className={styles.sessionLinksLabel}>Your current session</p>
          <div className={styles.sessionLinkBtns}>
            <button
              className={styles.smashBtn}
              onClick={() => navigate(`/my-pokemon/${sessionId}?filter=smash`)}
            >
              My Smashes ❤️‍🔥
            </button>
            <button
              className={styles.snuggleBtn}
              onClick={() => navigate(`/my-pokemon/${sessionId}?filter=snuggle`)}
            >
              My Snuggles 🩷
            </button>
          </div>
        </div>
      )}

      <form className={styles.pastSession} onSubmit={handleLoadPastSession}>
        <p className={styles.pastSessionLabel}>Have a session ID? Load your past results:</p>
        <div className={styles.pastSessionRow}>
          <input
            className={styles.pastSessionInput}
            type="text"
            placeholder="Paste session ID..."
            value={pastId}
            onChange={e => setPastId(e.target.value)}
          />
          <button type="submit" className={styles.pastSessionBtn}>Load</button>
        </div>
      </form>

      <Link to="/leaderboard" className={styles.leaderboardLink}>
        View Global Leaderboard →
      </Link>
    </div>
  );
}
