import { useState, useEffect, useCallback } from 'react';
import { getResults } from '../utils/api.js';

export function useResults(sessionId) {
  const [smashProfile, setSmashProfile] = useState(null);
  const [snuggleProfile, setSnuggleProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchResults() {
    try {
      const data = await getResults(sessionId);
      setSmashProfile(data.smashProfile);
      setSnuggleProfile(data.snuggleProfile);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetchResults().finally(() => setLoading(false));
  }, [sessionId]);

  const refresh = useCallback(() => {
    // Don't reset loading — avoids flickering blank on each vote
    fetchResults();
  }, [sessionId]);

  return { smashProfile, snuggleProfile, loading, error, refresh };
}
