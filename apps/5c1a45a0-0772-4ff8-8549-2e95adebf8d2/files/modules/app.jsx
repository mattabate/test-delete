import { useMemo, useState, Component } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Card,
  BarChart,
  Skeleton,
  Callout,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd, compactUsd } from './lib/format.js';

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

const ALL_STAGES = 'all';

function FilterBar({ stage, onStageChange, stages }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={stage} onValueChange={onStageChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Stage" />
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
      {stage !== ALL_STAGES ? (
        <Button variant="light" onClick={() => onStageChange(ALL_STAGES)}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}

function RegionChart({ rows }) {
  const { loading, error, retry } = rows;
  if (loading) {
    return (
      <div role="status" aria-label="Loading deals">
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="h-80 flex flex-col items-start justify-center gap-3">
        <p className="text-sm text-gray-500">Deals could not be loaded.</p>
        <Button onClick={retry}>Retry</Button>
      </div>
    );
  }
  return null;
}

function RepWinRateTable({ rows }) {
  const winRates = useMemo(() => {
    const byRep = new Map();
    for (const r of rows) {
      if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
      const entry = byRep.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Won') entry.won += 1;
      byRep.set(r.rep, entry);
    }
    return Array.from(byRep.values())
      .map((e) => ({ ...e, winRate: (e.won / e.closed) * 100 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card className="mt-6">
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">win rate by rep</div>
      {winRates.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No closed deals yet.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Won</TableHead>
              <TableHead className="text-right">Closed</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winRates.map((r) => (
              <TableRow key={r.rep}>
                <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
                <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function DealsView() {
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

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals.entries())
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const total = useMemo(() => filtered.reduce((sum, r) => sum + r.amount, 0), [filtered]);

  if (loading || error) {
    return <RegionChart rows={{ loading, error, retry }} />;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="mt-1 text-sm text-gray-500">
            Filter deals by stage to see how amount concentrates by region.
          </p>
        </div>
        <FilterBar stage={stage} onStageChange={setStage} stages={stages} />
      </div>

      {refreshing ? (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Updating...
        </p>
      ) : null}

      <Tabs defaultValue="region" className="mt-6">
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <Card className="mt-6">
            <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
              total amount{stage !== ALL_STAGES ? ` \u00b7 ${stage}` : ''}
            </div>
            <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{usd(total)}</div>
            {byRegion.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">No deals match this filter.</p>
            ) : (
              <BarChart
                data={byRegion}
                index="region"
                categories={['amount']}
                valueFormatter={compactUsd}
                className="mt-6 h-72"
              />
            )}
          </Card>
        </TabsContent>
        <TabsContent value="reps">
          <RepWinRateTable rows={rows} />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-gray-500">Snapshot data as of last refresh.</p>
    </div>
  );
}

function App() {
  return (
    <Section>
      <DealsView />
    </Section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
