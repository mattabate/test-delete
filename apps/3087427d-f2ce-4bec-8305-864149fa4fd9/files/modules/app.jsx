import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, note }) {
  return (
    <div className="bg-gray-50 p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {value === null ? '—' : value.toLocaleString('en-US')}
      </div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [counts, setCounts] = useState({ full: null, page1: null, page3: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const full = await ana.data.get('accounts');
        const page1 = await ana.data.get('accounts', 1);
        const page3 = await ana.data.get('accounts', 3);
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
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Account source row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts read from the stored <span className="font-mono">accounts</span> source via
        <span className="font-mono"> ana.data.get</span> with no page, page 1, and page 3.
      </p>

      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">Could not read the source: {error}</p>
        </Card>
      ) : (
        <div className="ana-readout-row grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200 mt-6">
          <Readout label="get(source) — no page" value={counts.full} note="full snapshot" />
          <Readout label="get(source, 1)" value={counts.page1} note="page 1" />
          <Readout label="get(source, 3)" value={counts.page3} note="page 3" />
        </div>
      )}

      {loading && !error ? (
        <p className="mt-4 text-sm text-gray-500" role="status">Loading…</p>
      ) : null}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
