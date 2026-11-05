import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, loading, error }) {
  return (
    <div className="ana-readout">
      <div className="ana-readout__label">{label}</div>
      <div className="ana-readout__value">
        {error ? 'error' : loading ? '...' : value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

function App() {
  const [counts, setCounts] = useState({
    none: { loading: true, value: 0, error: false },
    page1: { loading: true, value: 0, error: false },
    page3: { loading: true, value: 0, error: false },
  });

  useEffect(() => {
    let cancelled = false;

    async function load(key, args) {
      try {
        const rows = await ana.data.get('opportunities', ...args);
        if (!cancelled) {
          setCounts((prev) => ({
            ...prev,
            [key]: { loading: false, value: rows.length, error: false },
          }));
        }
      } catch (e) {
        if (!cancelled) {
          setCounts((prev) => ({
            ...prev,
            [key]: { loading: false, value: 0, error: true },
          }));
        }
      }
    }

    load('none', []);
    load('page1', [1]);
    load('page3', [3]);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · ana.data.get paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">
        Opportunity source paging test
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get against the "opportunities" stored
        source (5,000 rows from public.opportunity) under three calls.
      </p>
      <Card className="mt-6">
        <div className="ana-readout-row">
          <Readout
            label="get(source) — no page"
            value={counts.none.value}
            loading={counts.none.loading}
            error={counts.none.error}
          />
          <Readout
            label="get(source, 1)"
            value={counts.page1.value}
            loading={counts.page1.loading}
            error={counts.page1.error}
          />
          <Readout
            label="get(source, 3)"
            value={counts.page3.value}
            loading={counts.page3.loading}
            error={counts.page3.error}
          />
        </div>
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
