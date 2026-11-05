import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, loading }) {
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
    </Card>
  );
}

function App() {
  const [state, setState] = useState({ loading: true, noPage: 0, page1: 0, page3: 0, error: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [noPage, page1, page3] = await Promise.all([
          ana.data.get('orders'),
          ana.data.get('orders', 1),
          ana.data.get('orders', 3),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          noPage: noPage.length,
          page1: page1.length,
          page3: page3.length,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source pagination check</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Row counts by page from ana.data.get</h1>
      <p className="mt-1 text-sm text-gray-500">
        Reading the "orders" source (order table, 100,000 rows) with no page argument, page 1, and page 3.
      </p>
      {state.error ? (
        <div role="alert" className="mt-6 text-sm text-red-600">Failed to load: {state.error}</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Readout label="ana.data.get(orders)" value={state.noPage} loading={state.loading} />
          <Readout label="ana.data.get(orders, 1)" value={state.page1} loading={state.loading} />
          <Readout label="ana.data.get(orders, 3)" value={state.page3} loading={state.loading} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
