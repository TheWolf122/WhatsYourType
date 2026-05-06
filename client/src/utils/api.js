async function apiFetch(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getSession() {
  return apiFetch('/pokemon/session').then(data => data.pokemon);
}

export function castVote(sessionId, pokemonId, decision) {
  return apiFetch('/votes', {
    method: 'POST',
    body: JSON.stringify({ sessionId, pokemonId, decision }),
  });
}

export function getResults(sessionId) {
  return apiFetch(`/results/${sessionId}`);
}

export function getMyPokemon(sessionId, decision = null) {
  const qs = decision ? `?decision=${decision}` : '';
  return apiFetch(`/my-pokemon/${sessionId}${qs}`);
}

export function getLeaderboard(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.generation) params.set('generation', filters.generation);
  const qs = params.toString();
  return apiFetch(`/leaderboard${qs ? '?' + qs : ''}`);
}

export function getStats() {
  return apiFetch('/stats');
}

export function getPokemon(id) {
  return apiFetch(`/pokemon/${id}`);
}
