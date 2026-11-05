import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="ana-readout__value">{value === null ? '…' : value.toLocaleString('en-US')}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [counts, setCounts] = useState({ full: null, page1: null, page3: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const full = await ana.data.get('order_items');
        if (!cancelled) setCounts((c) => ({ ...c, full: full.length }));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      }
      try {
        const page1 = await ana.data.get('order_items', 1);
        if (!cancelled) setCounts((c) => ({ ...c, page1: page1.length }));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      }
      try {
        const page3 = await ana.data.get('order_items', 3);
        if (!cancelled) setCounts((c) => ({ ...c, page3: page3.length }));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · pagination test ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">order_item source — row counts by page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Source: public.order_item (Redshift), snapshot limited to 5,000 rows at publish. Each readout below calls
        ana.data.get with a different page argument.
      </p>

      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">Error loading source: {error}</p>
        </Card>
      ) : null}

      <div className="ana-readout-row mt-6">
        <Readout label="ana.data.get(source)" value={counts.full} note="No page argument — full snapshot read" />
        <Readout label="ana.data.get(source, 1)" value={counts.page1} note="Page 1" />
        <Readout label="ana.data.get(source, 3)" value={counts.page3} note="Page 3" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
