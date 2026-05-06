import { useEffect } from 'react';
import { useResults } from '../hooks/useResults.js';
import TypeBadge from './TypeBadge.jsx';
import styles from './ResultsPanel.module.css';

export default function ResultsPanel({ sessionId, isOpen, onClose }) {
  const { smashProfile, snuggleProfile, loading, refresh } = useResults(sessionId);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      <button className={styles.close} onClick={onClose}>✕</button>
      <h2 className={styles.heading}>Your Profiles</h2>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <div className={styles.columns}>
          <div className={styles.column}>
            <h3 className={styles.smashHeading}>Smash</h3>
            {smashProfile ? (
              <>
                <div className={styles.stat}>
                  <span className={styles.label}>Top type</span>
                  <TypeBadge type={smashProfile.topType} />
                </div>
                <div className={styles.stat}>
                  <span className={styles.label}>Fave gen</span>
                  <span>Gen {smashProfile.topGeneration}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.label}>Legendary</span>
                  <span>{Math.round(smashProfile.legendaryRate * 100)}%</span>
                </div>
              </>
            ) : (
              <p className={styles.empty}>Vote on more Pokémon to see your Smash profile</p>
            )}
          </div>

          <div className={styles.column}>
            <h3 className={styles.snuggleHeading}>Snuggle</h3>
            {snuggleProfile ? (
              <>
                <div className={styles.stat}>
                  <span className={styles.label}>Top type</span>
                  <TypeBadge type={snuggleProfile.topType} />
                </div>
                <div className={styles.stat}>
                  <span className={styles.label}>Fave gen</span>
                  <span>Gen {snuggleProfile.topGeneration}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.label}>Legendary</span>
                  <span>{Math.round(snuggleProfile.legendaryRate * 100)}%</span>
                </div>
              </>
            ) : (
              <p className={styles.empty}>Vote on more Pokémon to see your Snuggle profile</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
