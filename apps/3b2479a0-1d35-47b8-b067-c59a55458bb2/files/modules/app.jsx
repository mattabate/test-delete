import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const SOURCE = 'order_items';

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
        const noPageRows = await ana.data.get(SOURCE);
        const page1Rows = await ana.data.get(SOURCE, 1);
        const page3Rows = await ana.data.get(SOURCE, 3);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            noPage: noPageRows.length,
            page1: page1Rows.length,
            page3: page3Rows.length,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({ loading: false, error: e.message || String(e), noPage: null, page1: null, page3: null });
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get pagination counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by <code>ana.data.get('order_items')</code> with no page argument, with page 1, and with page 3, against a 3,000-row stored snapshot of the order_item table.
      </p>

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
          <Kpi label="get(source) · no page" value={state.noPage.toLocaleString('en-US')} note="full snapshot read" />
          <Kpi label="get(source, 1)" value={state.page1.toLocaleString('en-US')} note="page 1" />
          <Kpi label="get(source, 3)" value={state.page3.toLocaleString('en-US')} note="page 3" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
