import { useState, useEffect, useCallback, useRef } from 'react';

export function useSource(name) {
  const [state, setState] = useState({ rows: [], loading: true, refreshing: false, error: null });
  const mounted = useRef(true);

  const load = useCallback(() => {
    setState((s) => ({ ...s, refreshing: !s.loading, error: null }));
    const unsubscribe = ana.data.source(name, (result) => {
      if (!mounted.current) return;
      if (result.error) {
        setState({ rows: [], loading: false, refreshing: false, error: result.error });
      } else {
        setState({ rows: result.rows || [], loading: false, refreshing: false, error: null });
      }
    });
    return unsubscribe;
  }, [name]);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = load();
    return () => {
      mounted.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, [load]);

  return { ...state, retry: load };
}
