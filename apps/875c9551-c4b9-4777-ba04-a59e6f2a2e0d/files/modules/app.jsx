import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

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
          ana.data.get('orders'),
          ana.data.get('orders', 1),
          ana.data.get('orders', 3),
        ]);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            noPage: noPage.length,
            page1: page1.length,
            page3: page3.length,
          });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e.message, noPage: null, page1: null, page3: null });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparing row counts returned by ana.data.get for the "orders" source (sourced from public.order, 100,000+ rows) with no page argument, page 1, and page 3.
      </p>
      <div className="mt-6">
        {state.loading ? (
          <div role="status" aria-label="Loading row counts">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : state.error ? (
          <Card>
            <p role="alert" className="text-sm text-red-600">Could not load row counts: {state.error}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200">
            <Readout label="get(source)" value={count(state.noPage)} note="No page argument" />
            <Readout label="get(source, 1)" value={count(state.page1)} note="Page 1" />
            <Readout label="get(source, 3)" value={count(state.page3)} note="Page 3" />
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
