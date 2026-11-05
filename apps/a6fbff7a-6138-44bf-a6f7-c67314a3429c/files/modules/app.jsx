import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="ana-readout__value">{value === null ? '...' : value.toLocaleString('en-US')}</div>
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
        const all = await ana.data.get('orders');
        if (!cancelled) setNoPage(Array.isArray(all) ? all.length : (all.rows ? all.rows.length : 0));
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      try {
        const p1 = await ana.data.get('orders', 1);
        if (!cancelled) setPage1(Array.isArray(p1) ? p1.length : (p1.rows ? p1.rows.length : 0));
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      try {
        const p3 = await ana.data.get('orders', 3);
        if (!cancelled) setPage3(Array.isArray(p3) ? p3.length : (p3.rows ? p3.rows.length : 0));
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · page read test ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Orders source page counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the stored orders source, read with no page argument and with explicit pages 1 and 3.
      </p>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">Error reading source: {error}</p>
        </Card>
      ) : (
        <div className="ana-readout-row mt-6">
          <Readout label="get(source) · no page" value={noPage} note="Full snapshot read" />
          <Readout label="get(source, 1)" value={page1} note="Page 1" />
          <Readout label="get(source, 3)" value={page3} note="Page 3" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
