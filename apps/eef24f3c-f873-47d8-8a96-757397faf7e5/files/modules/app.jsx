import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from 'tremor';

const SOURCE = 'accounts';

function Kpi({ label, value, detail }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{value}</div>
      {detail ? <div className="mt-1 text-xs text-gray-500">{detail}</div> : null}
    </Card>
  );
}

function App() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [all, page1, page3] = await Promise.all([
          ana.data.get(SOURCE),
          ana.data.get(SOURCE, 1),
          ana.data.get(SOURCE, 3),
        ]);
        if (cancelled) return;
        setState({ status: 'ready', all, page1, page3 });
      } catch (e) {
        if (!cancelled) setState({ status: 'error', message: e.message });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">source paging test</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparing row counts returned by <code>ana.data.get</code> with no page argument against explicit page reads, over the <code>accounts</code> source.
      </p>

      {state.status === 'loading' && (
        <p role="status" className="mt-6 text-sm text-gray-500">Loading...</p>
      )}

      {state.status === 'error' && (
        <p role="alert" className="mt-6 text-sm text-red-600">Could not load source: {state.message}</p>
      )}

      {state.status === 'ready' && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Kpi
            label="get(source) - no page"
            value={state.all.length.toLocaleString('en-US')}
            detail="Full unpaged read"
          />
          <Kpi
            label="get(source, 1)"
            value={state.page1.length.toLocaleString('en-US')}
            detail={state.page1.hasMore ? 'hasMore: true' : 'hasMore: false'}
          />
          <Kpi
            label="get(source, 3)"
            value={state.page3.length.toLocaleString('en-US')}
            detail={state.page3.hasMore ? 'hasMore: true' : 'hasMore: false'}
          />
        </div>
      )}

      <div className="ana-gutter mt-8" />
      <div className="ana-terminal mt-8">
        <div className="ana-terminal__head">ana // source</div>
        <div className="ana-terminal__line">&gt; source "accounts" backs a 100,000-row table on the Redshift Public Test connector.</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
