import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton } from 'tremor';

const SOURCE = 'order_items';

function Readout({ label, value, note }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <div className="ana-readout__value">{value === null ? '-' : value.toLocaleString('en-US')}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </div>
  );
}

function App() {
  const [noPage, setNoPage] = useState(null);
  const [page1, setPage1] = useState(null);
  const [page3, setPage3] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [all, p1, p3] = await Promise.all([
          ana.data.get(SOURCE),
          ana.data.get(SOURCE, 1),
          ana.data.get(SOURCE, 3),
        ]);
        if (cancelled) return;
        setNoPage(all.length);
        setPage1(p1.length);
        setPage3(p3.length);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">[ ch.01 - paging behavior ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Order item row counts by page request</h1>
      <p className="mt-1 text-sm text-gray-500">
        Counts returned by ana.data.get against the order_items source, snapshot as of publish.
      </p>
      {loading ? (
        <div role="status" aria-label="Loading counts" className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-8">
          <p className="text-sm text-gray-700">Could not load source data.</p>
          <p className="mt-1 text-xs text-gray-500">{String(error.message || error)}</p>
        </Card>
      ) : (
        <div className="mt-8 ana-readout-row grid grid-cols-1 sm:grid-cols-3">
          <Readout label="get(source)" value={noPage} note="no page argument - full snapshot" />
          <Readout label="get(source, 1)" value={page1} note="first page" />
          <Readout label="get(source, 3)" value={page3} note="third page" />
        </div>
      )}
      <div className="ana-gutter mt-10" />
      <div className="ana-terminal mt-6">
        <div className="ana-terminal__head">ana // closing-note</div>
        <div className="ana-terminal__line">{'source order_items holds 5,000 rows, paged at up to 1,000 rows per request'}</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
