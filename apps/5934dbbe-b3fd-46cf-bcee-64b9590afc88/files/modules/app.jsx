import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const SOURCE = 'order_items';

function Readout({ label, value, note }) {
  return (
    <div className="bg-gray-50 p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{value}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [counts, setCounts] = useState({ full: null, page1: null, page3: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const full = await ana.data.get(SOURCE);
        const page1 = await ana.data.get(SOURCE, 1);
        const page3 = await ana.data.get(SOURCE, 3);
        if (!cancelled) {
          setCounts({
            full: full.length,
            page1: page1.length,
            page3: page3.length,
          });
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load source');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item row counts by page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparing rows returned by ana.data.get for the stored order_items source: a full read, page 1, and page 3.
      </p>
      <Card className="mt-6 p-0">
        {loading ? (
          <div role="status" aria-label="Loading counts" className="p-5">
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div role="alert" className="p-5 text-sm text-gray-500">{error}</div>
        ) : (
          <div className="ana-readout-row grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200">
            <Readout label="get(source) — no page" value={counts.full.toLocaleString('en-US')} note="full stored snapshot" />
            <Readout label="get(source, 1)" value={counts.page1.toLocaleString('en-US')} note="page 1" />
            <Readout label="get(source, 3)" value={counts.page3.toLocaleString('en-US')} note="page 3" />
          </div>
        )}
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
