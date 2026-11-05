import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

const count = (v) => v.toLocaleString('en-US');

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="ana-readout__value">{value}</div>
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
        const noPage = await ana.data.get('orders');
        const page1 = await ana.data.get('orders', 1);
        const page3 = await ana.data.get('orders', 3);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            noPage: noPage.length,
            page1: page1.length,
            page3: page3.length,
          });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e.message, noPage: null, page1: null, page3: null });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">{'[ ch.01 \u00b7 source paging test ]'}</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get paging behavior</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get for the stored "orders" source (3,000 rows, from the
        Redshift public test connector's order table), with no page argument, page 1, and page 3.
      </p>
      <div className="mt-6">
        {state.loading ? (
          <Card>
            <p role="status" className="text-sm text-gray-500">Loading row counts\u2026</p>
          </Card>
        ) : state.error ? (
          <Card>
            <p role="alert" className="text-sm text-red-600">Failed to load: {state.error}</p>
          </Card>
        ) : (
          <div className="ana-readout-row">
            <Readout label="no page" value={count(state.noPage)} note="ana.data.get('orders')" />
            <Readout label="page 1" value={count(state.page1)} note="ana.data.get('orders', 1)" />
            <Readout label="page 3" value={count(state.page3)} note="ana.data.get('orders', 3)" />
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
