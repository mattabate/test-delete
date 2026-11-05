import { useCallback, useSyncExternalStore } from 'react';

export function useSource(name) {
  const subscribe = useCallback((cb) => ana.data.source(name).subscribe(cb), [name]);
  const getSnapshot = useCallback(() => ana.data.source(name).getSnapshot(), [name]);
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return {
    rows: snap.data || [],
    loading: snap.status === 'loading',
    refreshing: snap.status === 'refreshing',
    error: snap.status === 'error' ? snap.error : null,
    retry: () => ana.data.source(name).refetch(),
  };
}
