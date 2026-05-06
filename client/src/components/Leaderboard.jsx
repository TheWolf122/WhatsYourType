import TypeBadge from './TypeBadge.jsx';
import styles from './Leaderboard.module.css';

export default function Leaderboard({ entries }) {
  if (!entries || !entries.length) {
    return <p className={styles.empty}>No votes yet</p>;
  }

  return (
    <ol className={styles.list}>
      {entries.map((p, i) => (
        <li key={p.id} className={`${styles.entry} ${i < 3 ? styles[`rank${i + 1}`] : ''}`}>
          <span className={styles.rank}>#{i + 1}</span>
          <img src={p.sprite_url} alt={p.name} className={styles.sprite} />
          <div className={styles.info}>
            <div className={styles.name}>
              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
            </div>
            <div className={styles.types}>
              <TypeBadge type={p.type_1} />
              {p.type_2 && <TypeBadge type={p.type_2} />}
            </div>
          </div>
          <span className={styles.count}>{p.vote_count}</span>
        </li>
      ))}
    </ol>
  );
}
