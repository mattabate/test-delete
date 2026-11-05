import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Kpi({ label, value, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {value === null ? '...' : count(value)}
      </div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
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
        const full = await ana.data.get('order_items');
        if (!cancelled) setNoPage(full.length);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      try {
        const p1 = await ana.data.get('order_items', 1);
        if (!cancelled) setPage1(p1.length);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      try {
        const p3 = await ana.data.get('order_items', 3);
        if (!cancelled) setPage3(p3.length);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · pagination test ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Source: order_items (Redshift, public.order_item), snapshot of up to 5,000 rows.
      </p>
      {error ? (
        <div role="alert" className="mt-4 text-sm text-red-600">{error}</div>
      ) : null}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Kpi label="get(source) — no page" value={noPage} note="Full snapshot read" />
        <Kpi label="get(source, 1)" value={page1} note="Page 1 (up to 1,000 rows)" />
        <Kpi label="get(source, 3)" value={page3} note="Page 3 (up to 1,000 rows)" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
