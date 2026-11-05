import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Card, Skeleton } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, loading }) {
  return (
    <div className="bg-white p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {loading ? '\u2026' : count(value)}
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = useState({ loading: true, error: null, full: null, page1: null, page3: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [full, page1, page3] = await Promise.all([
          ana.data.get('order_items'),
          ana.data.get('order_items', 1),
          ana.data.get('order_items', 3),
        ]);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            full: full.length,
            page1: page1.length,
            page3: page3.length,
          });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e.message || String(e), full: null, page1: null, page3: null });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging check</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">order_items row counts by read mode</h1>
      <p className="mt-1 text-sm text-gray-500">
        The stored source holds 3,000 rows from the order_item table. Each readout below calls
        ana.data.get with a different page argument and shows how many rows came back.
      </p>
      {state.error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-900">Could not load counts.</p>
          <p className="mt-1 text-xs text-gray-500">{state.error}</p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-px border border-gray-200 bg-gray-200 sm:grid-cols-3">
          <Readout label={"get(source) \u2014 no page"} value={state.full} loading={state.loading} />
          <Readout label="get(source, 1)" value={state.page1} loading={state.loading} />
          <Readout label="get(source, 3)" value={state.page3} loading={state.loading} />
        </div>
      )}
      {state.loading && (
        <div className="mt-6" role="status" aria-label="Loading counts">
          <Skeleton className="h-24 w-full" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
