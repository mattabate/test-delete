import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, loading, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2">
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <span className="font-mono text-3xl tabular-nums text-gray-900">{count(value)}</span>
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
        if (cancelled) return;
        setState((s) => ({ ...s, [key]: { loading: false, value: rows.length, error: null } }));
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, [key]: { loading: false, value: null, error: e.message || String(e) } }));
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
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Source pagination check</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the stored "opportunities" source, read three ways: full read, page 1, and page 3.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Readout
          label="ana.data.get(source)"
          value={state.full.value}
          loading={state.full.loading}
          note={state.full.error ? `Error: ${state.full.error}` : 'No page argument — full snapshot read'}
        />
        <Readout
          label="ana.data.get(source, 1)"
          value={state.page1.value}
          loading={state.page1.loading}
          note={state.page1.error ? `Error: ${state.page1.error}` : 'Page 1 — up to 1,000 rows'}
        />
        <Readout
          label="ana.data.get(source, 3)"
          value={state.page3.value}
          loading={state.page3.loading}
          note={state.page3.error ? `Error: ${state.page3.error}` : 'Page 3 — up to 1,000 rows'}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
