import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const count = (v) => (v == null ? '—' : v.toLocaleString('en-US'));

function CountCard({ label, value, loading }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2">
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <span className="font-mono text-3xl tabular-nums text-gray-900">{count(value)}</span>
        )}
      </div>
    </Card>
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
        const full = await ana.data.get('orders');
        const page1 = await ana.data.get('orders', 1);
        const page3 = await ana.data.get('orders', 3);
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
          setError(e.message || String(e));
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging · orders</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Row counts by page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Counts returned by ana.data.get for the stored orders source, with no page argument and with explicit pages 1 and 3.
      </p>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-700">Could not load source: {error}</p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CountCard label="get(source) — no page" value={counts.full} loading={loading} />
          <CountCard label="get(source, 1)" value={counts.page1} loading={loading} />
          <CountCard label="get(source, 3)" value={counts.page3} loading={loading} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
