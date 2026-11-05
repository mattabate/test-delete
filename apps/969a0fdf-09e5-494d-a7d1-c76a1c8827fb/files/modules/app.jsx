import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const fmt = (v) => (v === null ? '--' : v.toLocaleString('en-US'));

function CountCard({ label, note, value, loading, error }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2">
        {loading ? (
          <div role="status" aria-label={`Loading ${label}`}>
            <Skeleton className="h-9 w-24" />
          </div>
        ) : error ? (
          <span className="text-sm text-red-600">Failed to load</span>
        ) : (
          <span className="font-mono text-3xl tabular-nums text-gray-900">{fmt(value)}</span>
        )}
      </div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
  );
}

function App() {
  const [state, setState] = useState({
    full: { loading: true, value: null, error: null },
    page1: { loading: true, value: null, error: null },
    page3: { loading: true, value: null, error: null },
  });

  useEffect(() => {
    let cancelled = false;

    async function run(key, fn) {
      try {
        const rows = await fn();
        if (!cancelled) {
          setState((s) => ({ ...s, [key]: { loading: false, value: rows.length, error: null } }));
        }
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({ ...s, [key]: { loading: false, value: null, error: e } }));
        }
      }
    }

    run('full', () => ana.data.get('opportunities'));
    run('page1', () => ana.data.get('opportunities', 1));
    run('page3', () => ana.data.get('opportunities', 3));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging check</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Opportunity rows by read mode</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by three reads of the same stored source: a full read with no page argument, page 1, and page 3.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CountCard
          label="ana.data.get(source)"
          note="Full snapshot read, no page argument"
          value={state.full.value}
          loading={state.full.loading}
          error={state.full.error}
        />
        <CountCard
          label="ana.data.get(source, 1)"
          note="Page 1 (up to 1,000 rows)"
          value={state.page1.value}
          loading={state.page1.loading}
          error={state.page1.error}
        />
        <CountCard
          label="ana.data.get(source, 3)"
          note="Page 3 (up to 1,000 rows)"
          value={state.page3.value}
          loading={state.page3.loading}
          error={state.page3.error}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
