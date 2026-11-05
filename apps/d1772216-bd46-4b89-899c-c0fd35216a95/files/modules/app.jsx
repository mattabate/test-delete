import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton, Callout } from 'tremor';

const SOURCE = 'order_items';

function Readout({ label, value, note }) {
  return (
    <div className="bg-white p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {value === null ? <Skeleton className="h-9 w-20" /> : value.toLocaleString('en-US')}
      </div>
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
        const full = await ana.data.get(SOURCE);
        if (!cancelled) setCounts((c) => ({ ...c, full: full.length }));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      }
      try {
        const page1 = await ana.data.get(SOURCE, 1);
        if (!cancelled) setCounts((c) => ({ ...c, page1: page1.length }));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      }
      try {
        const page3 = await ana.data.get(SOURCE, 3);
        if (!cancelled) setCounts((c) => ({ ...c, page3: page3.length }));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · page count test ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item source paging</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get against the stored order_items source (3,000 rows), with no page argument and with explicit page requests.
      </p>

      {error ? (
        <Callout className="mt-6" title="A read failed" color="red">
          {error}
        </Callout>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200">
        <Readout label="get(source)" value={counts.full} note="no page argument" />
        <Readout label="get(source, 1)" value={counts.page1} note="page 1" />
        <Readout label="get(source, 3)" value={counts.page3} note="page 3" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
