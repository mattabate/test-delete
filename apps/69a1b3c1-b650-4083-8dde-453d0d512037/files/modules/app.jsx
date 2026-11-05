import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, loading }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <span className="ana-readout__value">{count(value)}</span>
      )}
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
        const all = await ana.data.get('orders');
        if (!cancelled) setNoPage(all.length);
        const p1 = await ana.data.get('orders', 1);
        if (!cancelled) setPage1(p1.length);
        const p3 = await ana.data.get('orders', 3);
        if (!cancelled) setPage3(p3.length);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order source row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the "orders" source, read without a page argument and at pages 1 and 3.
      </p>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">Could not load source: {error}</p>
        </Card>
      ) : (
        <div className="ana-readout-row mt-6">
          <Readout label="get(source) — no page" value={noPage} loading={noPage === null} />
          <Readout label="get(source, 1)" value={page1} loading={page1 === null} />
          <Readout label="get(source, 3)" value={page3} loading={page3 === null} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
