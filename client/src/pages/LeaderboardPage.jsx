import { useState, useEffect } from 'react';
import { getLeaderboard } from '../utils/api.js';
import Leaderboard from '../components/Leaderboard.jsx';
import styles from './LeaderboardPage.module.css';

const ALL_TYPES = [
  'normal','fire','water','electric','grass','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
];

export default function LeaderboardPage() {
  const [smash, setSmash] = useState([]);
  const [snuggle, setSnuggle] = useState([]);
  const [pass, setPass] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [generationFilter, setGenerationFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getLeaderboard({ type: typeFilter, generation: generationFilter })
      .then(data => {
        setSmash(data.smash);
        setSnuggle(data.snuggle);
        setPass(data.pass);
      })
      .finally(() => setLoading(false));
  }, [typeFilter, generationFilter]);

  return (
    <div className={styles.page}>
      <h1>Global Leaderboard</h1>

      <div className={styles.filters}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={styles.select}>
          <option value="">All Types</option>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <select value={generationFilter} onChange={e => setGenerationFilter(e.target.value)} className={styles.select}>
          <option value="">All Generations</option>
          {[1,2,3,4,5,6,7,8,9].map(g => (
            <option key={g} value={g}>Gen {g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <div className={styles.sections}>
          <section>
            <h2 className={styles.smashHeading}>Most Smashed 🔥</h2>
            <Leaderboard entries={smash} />
          </section>
          <section>
            <h2 className={styles.snuggleHeading}>Most Snuggled 🩷</h2>
            <Leaderboard entries={snuggle} />
          </section>
          <section>
            <h2 className={styles.passHeading}>Most Passed</h2>
            <Leaderboard entries={pass} />
          </section>
        </div>
      )}
    </div>
  );
}
