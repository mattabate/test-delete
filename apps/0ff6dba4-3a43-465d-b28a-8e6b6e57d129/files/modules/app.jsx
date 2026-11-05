import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="ana-readout__value">{value === null ? '—' : value.toLocaleString('en-US')}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [noPage, setNoPage] = useState(null);
  const [page1, setPage1] = useState(null);
  const [page3, setPage3] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [all, p1, p3] = await Promise.all([
          ana.data.get('orders'),
          ana.data.get('orders', 1),
          ana.data.get('orders', 3),
        ]);
        if (cancelled) return;
        setNoPage(all.length);
        setPage1(p1.length);
        setPage3(p3.length);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · paging behaviour ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order source row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparing ana.data.get('orders') with no page against explicit page reads, over the stored orders snapshot (100,000 rows).
      </p>
      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading counts">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-gray-700">Could not load the orders source.</p>
            <p className="mt-1 text-xs text-gray-500">{String(error.message || error)}</p>
          </Card>
        ) : (
          <div className="ana-readout-row">
            <Readout label="get(orders) · no page" value={noPage} note="full source read" />
            <Readout label="get(orders, 1)" value={page1} note="page 1 rows" />
            <Readout label="get(orders, 3)" value={page3} note="page 3 rows" />
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
