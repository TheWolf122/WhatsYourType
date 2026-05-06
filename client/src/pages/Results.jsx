import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.js';
import { getResults } from '../utils/api.js';
import typeDescriptions from '../utils/typeDescriptions.js';
import TypeBadge from '../components/TypeBadge.jsx';
import styles from './Results.module.css';

export default function Results() {
  const { sessionId: paramId } = useParams();
  const { sessionId: hookId } = useSession();
  const sessionId = paramId ?? hookId;
  const navigate = useNavigate();

  const [smashProfile, setSmashProfile] = useState(null);
  const [snuggleProfile, setSnuggleProfile] = useState(null);
  const [smashCount, setSmashCount] = useState(0);
  const [snuggleCount, setSnuggleCount] = useState(0);
  const [favoriteType, setFavoriteType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (!sessionId) return;
    getResults(sessionId)
      .then(data => {
        setSmashProfile(data.smashProfile);
        setSnuggleProfile(data.snuggleProfile);
        setSmashCount(data.smashCount ?? 0);
        setSnuggleCount(data.snuggleCount ?? 0);
        setFavoriteType(data.favoriteType ?? null);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className={styles.center}><p>Loading results...</p></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your Results</h1>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{smashCount}</span>
          <span className={styles.statLabel}>Smashed ❤️‍🔥</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{snuggleCount}</span>
          <span className={styles.statLabel}>Snuggled 🩷</span>
        </div>
        {favoriteType && (
          <div className={styles.stat}>
            <span className={styles.statValue}>
              <TypeBadge type={favoriteType} />
            </span>
            <span className={styles.statLabel}>Favourite Type</span>
          </div>
        )}
      </div>

      {favoriteType && typeDescriptions[favoriteType] && (
        <div className={styles.typeBlurb}>
          <span className={styles.typeBlurbLabel}>What your type says about you</span>
          <p className={styles.typeBlurbText}>{typeDescriptions[favoriteType]}</p>
        </div>
      )}

      <div className={styles.columns}>
        <div className={`${styles.card} ${styles.smashCard}`}>
          <h2 className={styles.smashTitle}>Your Smash Type</h2>
          {smashProfile ? (
            <div className={styles.profile}>
              <div className={styles.row}>
                <TypeBadge type={smashProfile.topType} />
                <span className={styles.typeName}>{smashProfile.topType}</span>
              </div>
              <p>Favourite Generation: Gen {smashProfile.topGeneration}</p>
              <p>You smashed {Math.round(smashProfile.legendaryRate * 100)}% legendary Pokémon</p>
            </div>
          ) : (
            <p className={styles.empty}>No Smash votes yet — keep going!</p>
          )}
        </div>

        <div className={`${styles.card} ${styles.snuggleCard}`}>
          <h2 className={styles.snuggleTitle}>Your Snuggle Type</h2>
          {snuggleProfile ? (
            <div className={styles.profile}>
              <div className={styles.row}>
                <TypeBadge type={snuggleProfile.topType} />
                <span className={styles.typeName}>{snuggleProfile.topType}</span>
              </div>
              <p>Favourite Generation: Gen {snuggleProfile.topGeneration}</p>
              <p>You snuggled {Math.round(snuggleProfile.legendaryRate * 100)}% legendary Pokémon</p>
            </div>
          ) : (
            <p className={styles.empty}>No Snuggle votes yet — keep going!</p>
          )}
        </div>
      </div>

      <div className={styles.sessionId}>
        <span className={styles.sessionIdLabel}>Session ID</span>
        <code className={styles.sessionIdCode}>{sessionId}</code>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className={styles.actions}>
        <button onClick={() => navigate(`/my-pokemon/${sessionId}`)} className={styles.btn}>
          See All My Pokémon
        </button>
        <button onClick={() => navigate('/vote')} className={`${styles.btn} ${styles.secondary}`}>
          Keep Voting
        </button>
      </div>
    </div>
  );
}
