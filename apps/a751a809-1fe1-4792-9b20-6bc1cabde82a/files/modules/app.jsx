import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <span className="ana-readout__value">{value === null ? '…' : value.toLocaleString('en-US')}</span>
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
    async function run() {
      try {
        const all = await ana.data.get('order_items');
        if (!cancelled) setNoPage(all.length);
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
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item source: page count check</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get against the order_items stored source (3,000 rows, Redshift Public Test).
      </p>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : (
        <div className="ana-readout-row mt-6">
          <Readout label="get(source) — no page" value={noPage} />
          <Readout label="get(source, 1)" value={page1} />
          <Readout label="get(source, 3)" value={page3} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
