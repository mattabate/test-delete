import { useState, useEffect } from 'react';

export function useSource(name) {
  const [state, setState] = useState({ rows: [], loading: true, error: null });
  useEffect(() => {
    let active = true;
    ana.data.source(name).subscribe((result) => {
      if (!active) return;
      setState({
        rows: result.rows || [],
        loading: result.loading,
        error: result.error || null,
      });
    });
    return () => { active = false; };
  }, [name]);
  return state;
}
