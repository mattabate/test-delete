import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => (v === null || v === undefined ? '—' : v.toLocaleString('en-US'));

function Readout({ label, value, note, loading }) {
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
    loading: true,
    error: null,
    noPage: null,
    page1: null,
    page3: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [noPage, page1, page3] = await Promise.all([
          ana.data.get('order_items'),
          ana.data.get('order_items', 1),
          ana.data.get('order_items', 3),
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
        setState((s) => ({ ...s, loading: false, error: e.message || String(e) }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">order items · pagination check</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparing rows returned for the `order_items` source with no page argument, page 1, and page 3.
      </p>

      {state.error ? (
        <div role="alert" className="mt-6">
          <Card>
            <p className="text-sm text-gray-900">Could not load row counts.</p>
            <p className="mt-1 text-xs text-gray-500">{state.error}</p>
          </Card>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Readout
            label="get(source) · no page"
            value={state.noPage}
            note="full stored snapshot"
            loading={state.loading}
          />
          <Readout
            label="get(source, 1)"
            value={state.page1}
            note="first page"
            loading={state.loading}
          />
          <Readout
            label="get(source, 3)"
            value={state.page3}
            note="third page"
            loading={state.loading}
          />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
