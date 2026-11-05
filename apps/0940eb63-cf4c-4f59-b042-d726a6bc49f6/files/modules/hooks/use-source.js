import { useSyncExternalStore } from 'react';

export function useSource(name) {
  return useSyncExternalStore(
    (cb) => ana.data.source(name).subscribe(cb),
    () => ana.data.source(name).getSnapshot(),
  );
}
