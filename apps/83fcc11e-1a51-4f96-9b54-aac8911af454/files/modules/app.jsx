import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{value}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
  );
}

function App() {
  const [state, setState] = useState({ loading: true, error: null, results: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const all = await ana.data.get('order_items');
        const page1 = await ana.data.get('order_items', 1);
        const page3 = await ana.data.get('order_items', 3);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            results: {
              all: all.length,
              page1: page1.length,
              page3: page3.length,
              page1HasMore: page1.hasMore,
              page3HasMore: page3.hasMore,
            },
          });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e.message, results: null });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging check</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item row counts by page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Stored source <span className="font-mono">order_items</span> snapshots 5,000 rows from the Redshift{' '}
        <span className="font-mono">public.order_item</span> table. Each readout below is the row count
        returned by a distinct <span className="font-mono">ana.data.get</span> call.
      </p>

      {state.loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : state.error ? (
        <div role="alert" className="mt-6 text-sm text-red-600">
          Could not load counts: {state.error}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Readout
            label="ana.data.get(source)"
            value={count(state.results.all)}
            note="full snapshot, no page argument"
          />
          <Readout
            label="ana.data.get(source, 1)"
            value={count(state.results.page1)}
            note={state.results.page1HasMore ? 'hasMore: true' : 'hasMore: false'}
          />
          <Readout
            label="ana.data.get(source, 3)"
            value={count(state.results.page3)}
            note={state.results.page3HasMore ? 'hasMore: true' : 'hasMore: false'}
          />
        </div>
      )}

      <div className="ana-terminal mt-8">
        <div className="ana-terminal__head">ana // closing-note</div>
        <div className="ana-terminal__line">
          Full reads return every stored row; numbered page reads return up to 1,000 rows (or 20 MiB) per page.
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
