import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton, Callout } from 'tremor';

const SOURCE = 'order_items';

function Readout({ label, value, note }) {
  return (
    <div className="bg-white p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{value}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [state, setState] = useState({ loading: true, error: null, noPage: null, page1: null, page3: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [noPage, page1, page3] = await Promise.all([
          ana.data.get(SOURCE),
          ana.data.get(SOURCE, 1),
          ana.data.get(SOURCE, 3),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          noPage: noPage.length,
          page1: page1.length,
          page3: page3.length,
        });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, error: e.message || String(e), noPage: null, page1: null, page3: null });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item paging test</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the order_items source (snapshot of 3,000 rows from the order_item table), compared across no page argument, page 1, and page 3.
      </p>

      {state.loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6">
          <Skeleton className="h-24 w-full" />
        </div>
      ) : state.error ? (
        <Callout title="Could not read source" className="mt-6">
          {state.error}
        </Callout>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-px border border-gray-200 bg-gray-200 sm:grid-cols-3">
          <Readout label="get(source)" value={state.noPage.toLocaleString('en-US')} note="no page argument" />
          <Readout label="get(source, 1)" value={state.page1.toLocaleString('en-US')} note="page 1" />
          <Readout label="get(source, 3)" value={state.page3.toLocaleString('en-US')} note="page 3" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
