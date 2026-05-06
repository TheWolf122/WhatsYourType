import TypeBadge from './TypeBadge.jsx';
import styles from './PokemonCard.module.css';

export default function PokemonCard({ pokemon, exiting }) {
  if (!pokemon) {
    return (
      <div className={styles.card}>
        <div className={styles.skeleton} />
        <div className={styles.skeletonText} />
      </div>
    );
  }

  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <div className={`${styles.card} ${exiting ? styles.exiting : ''}`}>
      <img
        src={pokemon.sprite_url}
        alt={pokemon.name}
        className={styles.sprite}
      />
      <h2 className={styles.name}>{name}</h2>
      <div className={styles.types}>
        <TypeBadge type={pokemon.type_1} />
        {pokemon.type_2 && <TypeBadge type={pokemon.type_2} />}
      </div>
    </div>
  );
}
