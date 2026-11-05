import { useMemo, useState, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button, Skeleton, Callout, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { ProbeCard } from './components/probe-card.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';
import { usd } from './lib/format.js';

const ALL_STAGES = 'all';

class Section extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <Callout title="This section could not load">{String(this.state.error.message || this.state.error)}</Callout>
    ) : (
      this.props.children
    );
  }
}

function aggregateByRegion(rows) {
  const totals = new Map();
  for (const row of rows) {
    const prev = totals.get(row.region) || 0;
    totals.set(row.region, prev + Number(row.amount));
  }
  return Array.from(totals.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function aggregateWinRateByRep(rows) {
  const totals = new Map();
  for (const row of rows) {
    if (row.stage !== 'Closed Won' && row.stage !== 'Closed Lost') continue;
    const prev = totals.get(row.rep) || { rep: row.rep, won: 0, lost: 0 };
    if (row.stage === 'Closed Won') prev.won += 1;
    else prev.lost += 1;
    totals.set(row.rep, prev);
  }
  return Array.from(totals.values())
    .map((r) => ({ ...r, rate: r.won / (r.won + r.lost) }))
    .sort((a, b) => b.rate - a.rate);
}

function FilterBar({ stage, onStageChange, stages, resultCount }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Stage</div>
        <Select value={stage} onValueChange={onStageChange}>
          <SelectTrigger className="mt-1 w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STAGES}>All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {stage !== ALL_STAGES ? (
        <Button variant="light" onClick={() => onStageChange(ALL_STAGES)}>
          Reset
        </Button>
      ) : null}
      <span className="ml-auto font-mono text-xs uppercase tracking-wide text-gray-500">
        {resultCount} deal{resultCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function Dashboard() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState(ALL_STAGES);

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (stage === ALL_STAGES) return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const byRegion = useMemo(() => aggregateByRegion(filtered), [filtered]);
  const total = useMemo(() => filtered.reduce((sum, r) => sum + Number(r.amount), 0), [filtered]);
  const winRateByRep = useMemo(() => aggregateWinRateByRep(rows), [rows]);

  if (loading) {
    return (
      <div role="status" aria-label="Loading deals">
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p className="text-sm text-gray-500">Deals could not be loaded.</p>
        <Button className="mt-3" onClick={retry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {refreshing ? (
        <p role="status" className="text-sm text-gray-500">
          Updating...
        </p>
      ) : null}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="mt-6 space-y-8">
            <Card>
              <FilterBar stage={stage} onStageChange={setStage} stages={stages} resultCount={filtered.length} />
            </Card>
            <div className="ana-figure">
              <span className="ana-figure__label">total amount · filtered</span>
              <div className="ana-figure__value">{usd(total)}</div>
            </div>
            {byRegion.length === 0 ? (
              <Card>
                <p className="text-sm text-gray-500">No deals match this filter.</p>
                <Button className="mt-3" variant="light" onClick={() => setStage(ALL_STAGES)}>
                  Reset filter
                </Button>
              </Card>
            ) : (
              <RegionChart rows={byRegion} />
            )}
            <ProbeCard />
          </div>
        </TabsContent>
        <TabsContent value="win-rate">
          <div className="mt-6">
            <WinRateTable rows={winRateByRep} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function App() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Synthetic sales deals</h1>
      <p className="text-sm text-gray-500">Amount by region, filterable by stage, with a slow compute probe.</p>
      <div className="mt-6">
        <Section>
          <Dashboard />
        </Section>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
