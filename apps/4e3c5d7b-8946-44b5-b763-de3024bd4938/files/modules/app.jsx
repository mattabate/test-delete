import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Skeleton } from 'tremor';
import { count } from './lib/format.js';
import { Kpi } from './components/kpi.jsx';

const SOURCE = 'orders';

function App() {
  const [noPage, setNoPage] = useState(null);
  const [page1, setPage1] = useState(null);
  const [page3, setPage3] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
        if (!cancelled) setError(e.message || String(e));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const loading = noPage === null || page1 === null || page3 === null;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">orders source &middot; page counts</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">Row counts returned by the orders source (sourced from the order table, 100,000 rows) under three read modes.</p>

      {error ? (
        <div role="alert" className="mt-6 text-sm text-red-700">Could not load source: {error}</div>
      ) : loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Kpi label="get(source) · no page" value={count(noPage)} note="Full snapshot read" />
          <Kpi label="get(source, 1)" value={count(page1)} note="Page 1" />
          <Kpi label="get(source, 3)" value={count(page3)} note="Page 3" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
