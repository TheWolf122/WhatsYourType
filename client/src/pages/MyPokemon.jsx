import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMyPokemon } from '../utils/api.js';
import TypeBadge from '../components/TypeBadge.jsx';
import styles from './MyPokemon.module.css';

export default function MyPokemon() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') ?? 'all');
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filter = activeFilter === 'all' ? null : activeFilter;
    getMyPokemon(sessionId, filter)
      .then(setPokemonList)
      .finally(() => setLoading(false));
  }, [sessionId, activeFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Pokémon</h1>
        <Link to={`/results/${sessionId}`} className={styles.back}>← Back to Results</Link>
      </div>

      <div className={styles.filters}>
        {['all', 'smash', 'snuggle'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ''}`}
          >
            {f === 'all' ? 'All' : f === 'smash' ? 'Smash ❤️‍🔥' : 'Snuggle 🩷'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.msg}>Loading...</p>
      ) : pokemonList.length === 0 ? (
        <p className={styles.msg}>No Pokémon here yet — go vote!</p>
      ) : (
        <div className={styles.grid}>
          {pokemonList.map((p, i) => (
            <div key={`${p.id}-${i}`} className={styles.cell}>
              <img src={p.sprite_url} alt={p.name} className={styles.sprite} />
              <div className={styles.name}>
                {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
              </div>
              <div className={styles.types}>
                <TypeBadge type={p.type_1} />
                {p.type_2 && <TypeBadge type={p.type_2} />}
              </div>
              <span className={`${styles.decision} ${styles[p.decision]}`}>
                {p.decision}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
