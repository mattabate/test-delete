import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

function ReadoutCell({ label, value, loading }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <span className="ana-readout__value">{value}</span>
      )}
    </div>
  );
}

function App() {
  const [counts, setCounts] = useState({ none: null, page1: null, page3: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [noPage, page1, page3] = await Promise.all([
          ana.data.get('order_items'),
          ana.data.get('order_items', 1),
          ana.data.get('order_items', 3),
        ]);
        if (cancelled) return;
        setCounts({
          none: Array.isArray(noPage) ? noPage.length : 0,
          page1: Array.isArray(page1) ? page1.length : 0,
          page3: Array.isArray(page3) ? page3.length : 0,
        });
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · pagination test ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item page counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the order_items source, with no page argument and with explicit pages 1 and 3.
      </p>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">Could not load source: {error}</p>
        </Card>
      ) : (
        <div className="ana-readout-row mt-6">
          <ReadoutCell label="get(source)" value={counts.none} loading={loading} />
          <ReadoutCell label="get(source, 1)" value={counts.page1} loading={loading} />
          <ReadoutCell label="get(source, 3)" value={counts.page3} loading={loading} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
