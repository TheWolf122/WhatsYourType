import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.js';
import { getPokemon, castVote } from '../utils/api.js';
import PokemonCard from '../components/PokemonCard.jsx';
import VoteButtons from '../components/VoteButtons.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ResultsPanel from '../components/ResultsPanel.jsx';
import styles from './Vote.module.css';

export default function Vote() {
  const navigate = useNavigate();
  const { sessionId, pokemonList, createSession } = useSession();

  const [currentIndex, setCurrentIndex] = useState(
    () => parseInt(localStorage.getItem('pokesmash_current_index') ?? '0')
  );
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [leavingPokemon, setLeavingPokemon] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Ref so the fetch effect can read the current card without it as a dependency
  const currentPokemonRef = useRef(null);
  useEffect(() => { currentPokemonRef.current = currentPokemon; }, [currentPokemon]);

  useEffect(() => {
    if (!sessionId) navigate('/');
  }, [sessionId]);

  useEffect(() => {
    if (!pokemonList.length || currentIndex >= pokemonList.length) return;

    // Save outgoing card so it can animate out
    if (currentPokemonRef.current) setLeavingPokemon(currentPokemonRef.current);
    setCurrentPokemon(null);

    // Clear the leaving card once its exit animation finishes (200ms)
    const exitTimer = setTimeout(() => setLeavingPokemon(null), 220);

    getPokemon(pokemonList[currentIndex])
      .then(setCurrentPokemon)
      .catch(err => setLoadError(err.message));

    return () => clearTimeout(exitTimer);
  }, [currentIndex, pokemonList]);

  function advance(next) {
    localStorage.setItem('pokesmash_current_index', next);
    setCurrentIndex(next);
  }

  async function handleVote(decision) {
    try {
      await castVote(sessionId, pokemonList[currentIndex], decision);
      setVoteError(null);
      advance(currentIndex + 1);
    } catch (err) {
      setVoteError('Vote failed — tap to retry.');
    }
  }

  function handleSkip() {
    advance(currentIndex + 1);
  }

  async function handleRetryLoad() {
    setLoadError(null);
    try {
      await createSession();
    } catch {
      setLoadError("Couldn't load Pokémon — please try again.");
    }
  }

  if (!sessionId) return null;

  if (loadError) {
    return (
      <div className={styles.center}>
        <p>{loadError}</p>
        <button onClick={handleRetryLoad} className={styles.retryBtn}>
          Tap to retry
        </button>
      </div>
    );
  }

  if (currentIndex >= pokemonList.length && pokemonList.length > 0) {
    return (
      <div className={styles.center}>
        <h2>You've seen every Pokémon!</h2>
        <button onClick={() => navigate(`/results/${sessionId}`)} className={styles.bigBtn}>
          See Full Results
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ProgressBar seen={currentIndex} total={pokemonList.length} />

      <div className={styles.cardArea}>
        {leavingPokemon && (
          <div className={styles.leavingSlot}>
            <PokemonCard pokemon={leavingPokemon} exiting />
          </div>
        )}
        <PokemonCard key={currentIndex} pokemon={currentPokemon} />
      </div>

      <VoteButtons onVote={handleVote} onSkip={handleSkip} />

      {voteError && <p className={styles.error}>{voteError}</p>}

      <button
        className={styles.resultsToggle}
        onClick={() => setIsPanelOpen(true)}
      >
        My Results
      </button>

      <ResultsPanel
        sessionId={sessionId}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
