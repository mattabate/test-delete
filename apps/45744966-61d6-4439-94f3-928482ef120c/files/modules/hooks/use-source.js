import { useSyncExternalStore } from 'react';

export function useSource(name) {
  const source = ana.data.source(name);
  return useSyncExternalStore(source.subscribe, source.getSnapshot);
}
