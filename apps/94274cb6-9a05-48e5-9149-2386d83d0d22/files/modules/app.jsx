import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton, Badge } from 'tremor';
import { Kpi } from './components/kpi.jsx';

function App() {
  const [state, setState] = useState({ loading: true, error: null, noPage: null, page1: null, page3: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const noPageRows = await ana.data.get('orders');
        const page1Rows = await ana.data.get('orders', 1);
        const page3Rows = await ana.data.get('orders', 3);
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
      <div className="ana-kicker">source paging test</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order source row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the stored orders source, read with no page, page 1, and page 3.
      </p>
      {state.loading ? (
        <div role="status" aria-label="Loading row counts" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : state.error ? (
        <Card className="mt-6">
          <p role="alert" className="text-sm text-gray-700">Could not load row counts: {state.error}</p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Kpi label="get('orders')" value={state.noPage.toLocaleString('en-US')} note="No page argument (full read)" />
          <Kpi label="get('orders', 1)" value={state.page1.toLocaleString('en-US')} note="Page 1" />
          <Kpi label="get('orders', 3)" value={state.page3.toLocaleString('en-US')} note="Page 3" />
        </div>
      )}
      <div className="mt-6">
        <Badge variant="neutral">Source: public.order, Redshift Public Test, snapshot as of last refresh</Badge>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
