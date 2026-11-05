import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <div className="ana-readout__label">{label}</div>
      <div className="ana-readout__value">{value === null ? '—' : value.toLocaleString('en-US')}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [noPage, setNoPage] = useState(null);
  const [page1, setPage1] = useState(null);
  const [page3, setPage3] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const all = await ana.data.get('orders');
        if (!cancelled) setNoPage(all.length);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      try {
        const p1 = await ana.data.get('orders', 1);
        if (!cancelled) setPage1(p1.length);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
      try {
        const p3 = await ana.data.get('orders', 3);
        if (!cancelled) setPage3(p3.length);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 · refinery automation test 1.4.1 ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get paging counts</h1>
      <p className="mt-1 text-sm text-gray-500">Source: orders snapshot from the Redshift Public Test connector, 3,000 rows.</p>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : null}
      <div className="ana-readout-row mt-6">
        <Readout label="get(source) — no page" value={noPage} note="full snapshot read" />
        <Readout label="get(source, 1)" value={page1} note="first page" />
        <Readout label="get(source, 3)" value={page3} note="third page" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
