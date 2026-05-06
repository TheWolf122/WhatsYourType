import { useState } from 'react';
import { getSession } from '../utils/api.js';

export function useSession() {
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem('pokesmash_session_id')
  );
  const [pokemonList, setPokemonList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pokesmash_pokemon_list')) ?? [];
    } catch {
      return [];
    }
  });

  async function createSession() {
    const id = crypto.randomUUID();
    const list = await getSession();
    localStorage.setItem('pokesmash_session_id', id);
    localStorage.setItem('pokesmash_pokemon_list', JSON.stringify(list));
    setSessionId(id);
    setPokemonList(list);
  }

  function loadSession(id) {
    localStorage.setItem('pokesmash_session_id', id);
    setSessionId(id);
  }

  function clearSession() {
    localStorage.removeItem('pokesmash_session_id');
    localStorage.removeItem('pokesmash_pokemon_list');
    localStorage.removeItem('pokesmash_current_index');
    setSessionId(null);
    setPokemonList([]);
  }

  return { sessionId, pokemonList, createSession, clearSession, loadSession };
}
