import { useMemo, useState, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Callout, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { StageFilter } from './components/stage-filter.jsx';
import { ProbePanel } from './components/probe-panel.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';

class Section extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <Callout title="This section could not load">
        {String(this.state.error.message || this.state.error)}
      </Callout>
    ) : (
      this.props.children
    );
  }
}

function aggregateByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
  }
  return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    const s = new Set(rows.map((r) => r.stage));
    return Array.from(s).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const chartRows = useMemo(() => aggregateByRegion(filteredRows), [filteredRows]);
  const [tab, setTab] = useState('overview');

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Sales deal amount by region</h1>
      {refreshing ? (
        <p role="status" className="mt-1 text-sm text-gray-500">
          Updating…
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StageFilter stage={stage} stages={stages} onChange={setStage} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <Section>
              <RegionChart rows={chartRows} loading={loading} error={error} retry={retry} />
            </Section>
            <Section>
              <ProbePanel />
            </Section>
          </div>
        </TabsContent>
        <TabsContent value="win-rate">
          <div className="mt-6 grid grid-cols-1 gap-6">
            <Section>
              <WinRateTable rows={rows} loading={loading} error={error} retry={retry} />
            </Section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
