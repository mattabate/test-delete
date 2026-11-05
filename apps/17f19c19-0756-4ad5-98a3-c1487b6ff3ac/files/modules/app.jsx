import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Callout, Skeleton } from 'tremor';
import { count } from './lib/format.js';
import { Readout } from './components/readout.jsx';

const SOURCE = 'accounts';

function App() {
  const [state, setState] = useState({ loading: true, error: null, noPage: null, page1: null, page3: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [noPage, page1, page3] = await Promise.all([
          ana.data.get(SOURCE),
          ana.data.get(SOURCE, 1),
          ana.data.get(SOURCE, 3),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          noPage: noPage.length,
          page1: page1.length,
          page3: page3.length,
        });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, error: e && e.message ? e.message : 'Failed to load source', noPage: null, page1: null, page3: null });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="ana-kicker">{'[ ch.01 \u00b7 source paging ]'}</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">ana.data.get row counts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Row counts returned from the <span className="font-mono">accounts</span> source under three read modes.
      </p>

      <Card className="mt-6">
        {state.loading ? (
          <div role="status" aria-label="Loading row counts">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : state.error ? (
          <div role="alert">
            <Callout title="Could not load source" color="red">
              {state.error}
            </Callout>
          </div>
        ) : (
          <Readout
            items={[
              { label: 'get(source) \u2014 no page', value: count(state.noPage) },
              { label: 'get(source, 1)', value: count(state.page1) },
              { label: 'get(source, 3)', value: count(state.page3) },
            ]}
          />
        )}
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
