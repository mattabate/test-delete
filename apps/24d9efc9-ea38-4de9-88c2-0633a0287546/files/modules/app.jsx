import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const SOURCE = 'order_items';

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="ana-readout__value">{value === null ? '—' : value.toLocaleString('en-US')}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [state, setState] = useState({ loading: true, error: null, noPage: null, page1: null, page3: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const full = await ana.data.get(SOURCE);
        const p1 = await ana.data.get(SOURCE, 1);
        const p3 = await ana.data.get(SOURCE, 3);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          noPage: full.length,
          page1: p1.length,
          page3: p3.length,
        });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, error: e.message || String(e), noPage: null, page1: null, page3: null });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">ch.01 · pagination behavior</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Counts returned by <code>ana.data.get</code> against the <code>order_items</code> stored source (5,000 rows), with no page argument and with explicit page numbers.
      </p>

      {state.loading ? (
        <div role="status" aria-label="Loading counts" className="mt-8">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : state.error ? (
        <Card className="mt-8">
          <p role="alert" className="text-sm text-gray-700">Could not read the source: {state.error}</p>
        </Card>
      ) : (
        <div className="mt-8 ana-readout-row grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-200 bg-gray-200">
          <div className="bg-gray-50 p-5">
            <Readout label="get(source) — no page" value={state.noPage} note="Full snapshot read" />
          </div>
          <div className="bg-gray-50 p-5">
            <Readout label="get(source, 1)" value={state.page1} note="First page" />
          </div>
          <div className="bg-gray-50 p-5">
            <Readout label="get(source, 3)" value={state.page3} note="Third page" />
          </div>
        </div>
      )}

      <div className="ana-terminal mt-8">
        <div className="ana-terminal__head">ana // closing-note</div>
        <div className="ana-terminal__line">each Parquet page stops at 1,000 rows or 20 MiB, whichever comes first.</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
