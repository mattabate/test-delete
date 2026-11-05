import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Callout, Skeleton } from 'tremor';
import { Kpi } from './components/kpi.jsx';

const SOURCE = 'order_items';

function App() {
  const [state, setState] = useState({ loading: true, error: null, counts: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [all, page1, page3] = await Promise.all([
          ana.data.get(SOURCE),
          ana.data.get(SOURCE, 1),
          ana.data.get(SOURCE, 3),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          counts: {
            all: all.length,
            page1: page1.length,
            page3: page3.length,
          },
        });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, error: e.message || String(e), counts: null });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">
        Row counts by page request
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        The stored source {SOURCE} holds 3,000 order line records. Each card
        shows how many rows a given <code>ana.data.get</code> call returns.
      </p>

      {state.loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : state.error ? (
        <Callout className="mt-6" title="Could not load source">
          {state.error}
        </Callout>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Kpi
            label="get(source) — no page"
            value={state.counts.all}
            note="Full snapshot read"
          />
          <Kpi
            label="get(source, 1)"
            value={state.counts.page1}
            note="First page (up to 1,000 rows)"
          />
          <Kpi
            label="get(source, 3)"
            value={state.counts.page3}
            note="Third page"
          />
        </div>
      )}

      <div className="ana-terminal mt-8">
        <div className="ana-terminal__head">ana // paging-note</div>
        <div className="ana-terminal__line">
          A full read returns every stored row; a paged read returns at
          most 1,000 rows per page.
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
