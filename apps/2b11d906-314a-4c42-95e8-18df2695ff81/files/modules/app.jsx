import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { usd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

function FilterBar({ stage, setStage, stages }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-wide text-gray-500">Filter by stage</span>
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          {stages.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {stage !== 'all' ? (
        <Button variant="secondary" onClick={() => setStage('all')}>Reset filter</Button>
      ) : null}
    </div>
  );
}

function WinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = totals.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals.values())
      .map((e) => ({ ...e, winRate: e.closed ? e.won / e.closed : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  if (byRep.length === 0) {
    return <div className="mt-6 flex h-60 items-center justify-center text-sm text-gray-500">No closed deals to compute win rate.</div>;
  }

  return (
    <Table className="mt-6">
      <TableHeader>
        <TableRow>
          <TableHead>Rep</TableHead>
          <TableHead className="text-right">Closed deals</TableHead>
          <TableHead className="text-right">Won</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {byRep.map((r) => (
          <TableRow key={r.rep}>
            <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
            <TableCell className="text-right tabular-nums">{r.won}</TableCell>
            <TableCell className="text-right tabular-nums">{(r.winRate * 100).toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RegionChart({ rows }) {
  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [rows]);

  if (byRegion.length === 0) {
    return <div className="mt-6 flex h-60 items-center justify-center text-sm text-gray-500">No deals match this filter.</div>;
  }

  return (
    <BarChart
      data={byRegion}
      index="region"
      categories={['amount']}
      valueFormatter={usd}
      className="mt-6 h-72"
      yAxisWidth={75}
    />
  );
}

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.stage))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'all' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + Number(r.amount), 0),
    [filtered],
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Amount by region</h1>
      <p className="mt-1 text-sm text-gray-500">Synthetic deal amounts, filterable by pipeline stage.</p>

      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 h-72">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button onClick={retry} className="mt-2">Retry</Button>
        </div>
      ) : (
        <Tabs defaultValue="region" className="mt-6">
          <TabsList>
            <TabsTrigger value="region">Amount by region</TabsTrigger>
            <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <Card className="mt-6">
              <FilterBar stage={stage} setStage={setStage} stages={stages} />
              <div className="ana-figure mt-6">
                <span className="ana-figure__label">total amount · {stage === 'all' ? 'all stages' : stage}</span>
                <div className="ana-figure__value">{usd(total)}</div>
                <span className="ana-figure__note">{filtered.length} deals</span>
              </div>
              <RegionChart rows={filtered} />
            </Card>
          </TabsContent>
          <TabsContent value="win-rate">
            <Card className="mt-6">
              <p className="text-sm text-gray-500">Share of closed deals (Closed Won vs. Closed Lost) each rep won.</p>
              <WinRateTable rows={rows} />
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
