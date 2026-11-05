import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const SOURCE = 'accounts';

function Readout({ label, value, loading }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2">
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <span className="font-mono text-3xl tabular-nums text-gray-900">{value}</span>
        )}
      </div>
    </Card>
  );
}

function App() {
  const [state, setState] = useState({
    full: { loading: true, value: null },
    page1: { loading: true, value: null },
    page3: { loading: true, value: null },
  });

  useEffect(() => {
    let cancelled = false;

    async function run(key, args) {
      try {
        const rows = await ana.data.get(...args);
        if (!cancelled) {
          setState((s) => ({ ...s, [key]: { loading: false, value: rows.length } }));
        }
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({ ...s, [key]: { loading: false, value: 'error' } }));
        }
      }
    }

    run('full', [SOURCE]);
    run('page1', [SOURCE, 1]);
    run('page3', [SOURCE, 3]);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">ana.data.get · pagination check</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Row counts by page argument</h1>
      <p className="mt-1 text-sm text-gray-500">
        Source "{SOURCE}" is a stored snapshot of the account table (100,000 rows). Each card calls
        ana.data.get with a different page argument and reports how many rows came back.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Readout label="get(source) — no page" value={state.full.value} loading={state.full.loading} />
        <Readout label="get(source, 1)" value={state.page1.value} loading={state.page1.loading} />
        <Readout label="get(source, 3)" value={state.page3.value} loading={state.page3.loading} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
