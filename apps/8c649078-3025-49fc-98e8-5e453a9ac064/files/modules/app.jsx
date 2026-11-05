import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

function Kpi({ label, value, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {value === null ? <Skeleton className="h-9 w-24" /> : value.toLocaleString('en-US')}
      </div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
  );
}

function App() {
  const [counts, setCounts] = useState({ full: null, page1: null, page3: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const full = await ana.data.get('orders');
        const page1 = await ana.data.get('orders', 1);
        const page3 = await ana.data.get('orders', 3);
        if (!cancelled) {
          setCounts({
            full: full.length,
            page1: page1.length,
            page3: page3.length,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Source pagination counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the stored "orders" source (3,000 rows, from the Redshift public.order table), with no page argument versus page 1 and page 3.
      </p>
      {error ? (
        <div role="alert" className="mt-6 text-sm text-red-600">Failed to load counts: {error}</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Kpi label="get(source) — no page" value={counts.full} note="Full snapshot read" />
          <Kpi label="get(source, 1)" value={counts.page1} note="Page 1" />
          <Kpi label="get(source, 3)" value={counts.page3} note="Page 3" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
