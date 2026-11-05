import { useCallback, useSyncExternalStore } from 'react';

export function useSource(name) {
  const src = ana.data.source(name);
  const subscribe = useCallback((cb) => src.subscribe(cb), [src]);
  const getSnapshot = useCallback(() => src.getSnapshot ? src.getSnapshot() : src.snapshot, [src]);
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return {
    rows: snap?.rows || [],
    loading: snap?.status === 'loading',
    refreshing: snap?.status === 'refreshing',
    error: snap?.status === 'error' ? snap.error : null,
    retry: () => src.retry && src.retry(),
  };
}
