import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

function Kpi({ label, value, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{value}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
  );
}

function App() {
  const [state, setState] = useState({ loading: true, error: null, noPage: null, page1: null, page3: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const full = await ana.data.get('order_items');
        const p1 = await ana.data.get('order_items', 1);
        const p3 = await ana.data.get('order_items', 3);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          noPage: full.length,
          page1: p1.length,
          page3: p3.length,
        });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, error: e.message || String(e), noPage: null, page1: null, page3: null });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging · order_items</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">Comparing row counts returned with no page argument versus explicit page requests, from a stored source of 3,000 order line items.</p>

      {state.loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : state.error ? (
        <div role="alert" className="mt-6 text-sm text-red-600">Could not load source: {state.error}</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Kpi label="get(source) · no page" value={state.noPage} note="Full snapshot read" />
          <Kpi label="get(source, 1)" value={state.page1} note="First page" />
          <Kpi label="get(source, 3)" value={state.page3} note="Third page" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
