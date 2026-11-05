import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, loading }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <span className="ana-readout__value">{loading ? '…' : count(value)}</span>
    </div>
  );
}

function App() {
  const [state, setState] = useState({
    noPage: null,
    page1: null,
    page3: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [noPage, page1, page3] = await Promise.all([
          ana.data.get('orders'),
          ana.data.get('orders', 1),
          ana.data.get('orders', 3),
        ]);
        if (!cancelled) {
          setState({
            noPage: noPage.length,
            page1: page1.length,
            page3: page3.length,
            loading: false,
            error: null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: e.message }));
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · refinery automation test 1.4.1 ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">
        ana.data.get paging counts
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by the stored source "orders" (public.order, 100,000 rows) under three read modes.
      </p>
      {state.error ? (
        <div role="alert" className="mt-6 text-sm text-red-600">
          Could not load source: {state.error}
        </div>
      ) : (
        <div className="ana-readout-row mt-6">
          <Readout label="get(source) — no page" value={state.noPage} loading={state.loading} />
          <Readout label="get(source, 1)" value={state.page1} loading={state.loading} />
          <Readout label="get(source, 3)" value={state.page3} loading={state.loading} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
