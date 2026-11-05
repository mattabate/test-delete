import { useEffect, useState } from "react";

// ana.data.get returns rows for an embedded snapshot and a Promise for an on-demand one; await covers both.
export function useSnapshot(name) {
  const [state, setState] = useState({ rows: [], loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => ana.data.get(name))
      .then((rows) => {
        if (!cancelled) setState({ rows: Array.isArray(rows) ? rows : [], loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ rows: [], loading: false, error: String(e.message || e) });
      });
    return () => {
      cancelled = true;
    };
  }, [name]);
  return state;
}
