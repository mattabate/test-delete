import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, loading }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="font-mono text-3xl tabular-nums text-gray-900">
        {loading ? '…' : value.toLocaleString('en-US')}
      </div>
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
      <div className="ana-kicker">source paging test</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Order source page counts</h1>
      <p className="text-sm text-gray-500 mt-1">
        Row counts returned by <code>ana.data.get</code> against the stored
        <code> orders</code> source, with no page argument and with explicit page
        numbers 1 and 3.
      </p>
      {error ? (
        <Card className="mt-6">
          <p role="alert" className="text-sm text-gray-900">Could not load source: {error}</p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200">
          <div className="bg-gray-50 p-5">
            <Readout label="get('orders') — full" value={counts.full ?? 0} loading={loading} />
          </div>
          <div className="bg-gray-50 p-5">
            <Readout label="get('orders', 1)" value={counts.page1 ?? 0} loading={loading} />
          </div>
          <div className="bg-gray-50 p-5">
            <Readout label="get('orders', 3)" value={counts.page3 ?? 0} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
