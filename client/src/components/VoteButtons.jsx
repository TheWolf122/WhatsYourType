import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext.jsx';
import styles from './VoteButtons.module.css';

const SMASH_EMOJIS = ['🔥', '⚡', '🔥', '⚡', '🔥'];
const SNUGGLE_EMOJIS = ['🩷', '💗', '💕', '💖', '🩷'];

let nextId = 0;

export default function VoteButtons({ onVote, onSkip }) {
  const { setTheme } = useTheme();
  const [hovering, setHovering] = useState(null);
  const [particles, setParticles] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!hovering) {
      clearInterval(intervalRef.current);
      return;
    }

    const emojis = hovering === 'smash' ? SMASH_EMOJIS : SNUGGLE_EMOJIS;

    intervalRef.current = setInterval(() => {
      const id = nextId++;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const x = Math.random() * 88 + 6;          // 6–94vw
      const size = Math.random() * 14 + 14;       // 14–28px
      const duration = Math.random() * 800 + 1400; // 1400–2200ms
      const drift = (Math.random() - 0.5) * 80;   // horizontal wobble

      setParticles(prev => [...prev, { id, emoji, x, size, duration, drift }]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, duration);
    }, 140);

    return () => clearInterval(intervalRef.current);
  }, [hovering]);

  function handleEnter(type) {
    setTheme(type);
    setHovering(type);
  }

  function handleLeave() {
    setTheme('neutral');
    setHovering(null);
  }

  return (
    <>
      {particles.map(p => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.x}vw`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}ms`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      <div className={styles.container}>
        <div className={styles.row}>
          <button
            className={`${styles.btn} ${styles.smash}`}
            onMouseEnter={() => handleEnter('smash')}
            onMouseLeave={handleLeave}
            onClick={() => onVote('smash')}
          >
            Smash 🔥
          </button>
          <button
            className={`${styles.btn} ${styles.snuggle}`}
            onMouseEnter={() => handleEnter('snuggle')}
            onMouseLeave={handleLeave}
            onClick={() => onVote('snuggle')}
          >
            Snuggle 🩷
          </button>
        </div>
        <div className={styles.row}>
          <button
            className={`${styles.btn} ${styles.pass}`}
            onClick={() => onVote('pass')}
          >
            Pass
          </button>
          <button
            className={`${styles.btn} ${styles.skip}`}
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </>
  );
}
