import { useSyncExternalStore } from 'react';

export function useSource(name) {
  const source = ana.data.source(name);
  const snapshot = useSyncExternalStore(source.subscribe, source.getSnapshot);
  return {
    rows: snapshot.rows || [],
    loading: snapshot.loading,
    refreshing: snapshot.refreshing,
    error: snapshot.error,
    retry: snapshot.retry,
  };
}
