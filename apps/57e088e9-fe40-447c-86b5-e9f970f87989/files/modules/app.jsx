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
        setNoPage(Array.isArray(all) ? all.length : 0);
        setPage1(Array.isArray(p1) ? p1.length : 0);
        setPage3(Array.isArray(p3) ? p3.length : 0);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const loading = noPage === null && !error;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Orders source row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the stored "orders" source (snapshot of public.order on the Redshift connector), read three ways.
      </p>

      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">Could not load source: {error}</p>
        </Card>
      ) : loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6">
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="ana-readout-row mt-6">
          <Readout label="get(source) — no page" value={noPage} note="full stored snapshot" />
          <Readout label="get(source, 1)" value={page1} note="first page" />
          <Readout label="get(source, 3)" value={page3} note="third page" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
