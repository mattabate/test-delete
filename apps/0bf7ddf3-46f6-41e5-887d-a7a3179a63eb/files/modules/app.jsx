import { useMemo, useState, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Callout, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { FilterBar } from './components/filter-bar.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';
import { currency } from './lib/format.js';

class Section extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    return this.state.error
      ? <Callout title="This section could not load">{String(this.state.error.message || this.state.error)}</Callout>
      : this.props.children;
  }
}

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals.entries())
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const total = useMemo(() => filtered.reduce((sum, r) => sum + Number(r.amount), 0), [filtered]);

  const winRateByRep = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
      const entry = totals.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals.values())
      .map((e) => ({ ...e, winRate: e.closed ? e.won / e.closed : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc141-qa-f054-app</div>
      <div className="flex flex-wrap items-start justify-between gap-4 mt-2">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sales deals explorer</h1>
          <p className="text-sm text-gray-500">Amount by region, filterable by stage</p>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="by-region">
          <TabsList>
            <TabsTrigger value="by-region">Amount by region</TabsTrigger>
            <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="by-region">
            <div className="mt-6">
              <Section>
                {loading ? (
                  <div role="status" aria-label="Loading deals"><Skeleton className="h-10 w-full" /></div>
                ) : error ? (
                  <div role="alert">
                    <p className="text-sm text-gray-500">Deals could not be loaded.</p>
                    <Button onClick={retry}>Retry</Button>
                  </div>
                ) : (
                  <FilterBar
                    stage={stage}
                    stages={stages}
                    onChange={setStage}
                    onReset={() => setStage('all')}
                  />
                )}
              </Section>
            </div>

            <div className="mt-8">
              <Section>
                {loading ? (
                  <div role="status" aria-label="Loading chart"><Skeleton className="h-72 w-full" /></div>
                ) : error ? null : filtered.length === 0 ? (
                  <div className="text-sm text-gray-500">No deals match this filter.</div>
                ) : (
                  <>
                    <div className="ana-figure">
                      <span className="ana-figure__label">total amount · filtered</span>
                      <div className="ana-figure__value">{currency(total)}</div>
                    </div>
                    <div className="mt-6">
                      <RegionChart data={byRegion} />
                    </div>
                  </>
                )}
              </Section>
            </div>
          </TabsContent>
          <TabsContent value="win-rate">
            <div className="mt-8">
              <Section>
                {loading ? (
                  <div role="status" aria-label="Loading win rate"><Skeleton className="h-72 w-full" /></div>
                ) : error ? null : winRateByRep.length === 0 ? (
                  <div className="text-sm text-gray-500">No closed deals yet.</div>
                ) : (
                  <WinRateTable data={winRateByRep} />
                )}
              </Section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
