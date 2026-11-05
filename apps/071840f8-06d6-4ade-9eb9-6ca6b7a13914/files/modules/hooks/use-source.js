import { useSyncExternalStore } from 'react';

export function useSource(name) {
  const source = ana.data.source(name);
  const snapshot = useSyncExternalStore(source.subscribe, source.getSnapshot);
  return {
    rows: snapshot.rows || [],
    loading: Boolean(snapshot.loading),
    refreshing: Boolean(snapshot.refreshing),
    error: snapshot.error,
    retry: snapshot.retry,
  };
}
