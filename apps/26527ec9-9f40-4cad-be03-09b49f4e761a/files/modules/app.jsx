import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Skeleton, Button } from 'tremor';
import { Kpi } from './components/kpi.jsx';

const SOURCE = 'opportunities';

function App() {
  const [state, setState] = useState({ loading: true, error: null, noPage: null, page1: null, page3: null });

  async function load() {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const full = await ana.data.get(SOURCE);
      const p1 = await ana.data.get(SOURCE, 1);
      const p3 = await ana.data.get(SOURCE, 3);
      setState({
        loading: false,
        error: null,
        noPage: full.length,
        page1: p1.length,
        page3: p3.length,
      });
    } catch (e) {
      setState({ loading: false, error: e.message, noPage: null, page1: null, page3: null });
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Pagination count check</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned by ana.data.get against the stored "opportunities" source, read without a page argument and with explicit page numbers.
      </p>

      {state.loading ? (
        <div role="status" aria-label="Loading counts" className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : state.error ? (
        <Card className="mt-6">
          <p role="alert" className="text-sm text-gray-700">Could not load counts: {state.error}</p>
          <Button className="mt-3" onClick={load}>Retry</Button>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Kpi label="get(source) — no page" value={state.noPage.toLocaleString('en-US')} note="Full snapshot read" />
          <Kpi label="get(source, 1)" value={state.page1.toLocaleString('en-US')} note="First page" />
          <Kpi label="get(source, 3)" value={state.page3.toLocaleString('en-US')} note="Third page" />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
