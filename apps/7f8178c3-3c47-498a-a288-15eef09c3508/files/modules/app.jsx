import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, loading, error }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="font-mono text-3xl tabular-nums text-gray-900">
        {error ? '—' : loading ? '…' : value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = useState({
    all: { loading: true, value: 0, error: null },
    page1: { loading: true, value: 0, error: null },
    page3: { loading: true, value: 0, error: null },
  });

  useEffect(() => {
    let cancelled = false;

    async function run(key, fn) {
      try {
        const rows = await fn();
        if (!cancelled) {
          setState((s) => ({ ...s, [key]: { loading: false, value: rows.length, error: null } }));
        }
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({ ...s, [key]: { loading: false, value: 0, error: e.message || 'failed' } }));
        }
      }
    }

    run('all', () => ana.data.get('order_items'));
    run('page1', () => ana.data.get('order_items', 1));
    run('page3', () => ana.data.get('order_items', 3));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="ana-kicker">[ ch.01 · source paging ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Row counts from order_items</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparing ana.data.get(source) with no page against explicit page 1 and page 3 reads.
      </p>
      <Card className="mt-6">
        <div className="ana-readout-row grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200">
          <div className="bg-gray-50 p-5">
            <Readout label="no page (full read)" {...state.all} />
          </div>
          <div className="bg-gray-50 p-5">
            <Readout label="page 1" {...state.page1} />
          </div>
          <div className="bg-gray-50 p-5">
            <Readout label="page 3" {...state.page3} />
          </div>
        </div>
      </Card>
      {(state.all.error || state.page1.error || state.page3.error) && (
        <p className="mt-4 text-sm text-red-600">
          One or more reads failed: {state.all.error || state.page1.error || state.page3.error}
        </p>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
