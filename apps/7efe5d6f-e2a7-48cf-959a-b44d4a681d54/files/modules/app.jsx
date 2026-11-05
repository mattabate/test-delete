import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd, compactUsd } from './lib/format.js';

function FilterBar({ stage, setStage, stages }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">Stage</div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {stage !== 'all' ? (
        <Button variant="light" onClick={() => setStage('all')}>Reset</Button>
      ) : null}
    </div>
  );
}

function RegionChart({ rows }) {
  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.amount, 0), [rows]);

  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Amount by region</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 font-mono tabular-nums">{compactUsd(total)}</div>
      <div className="text-xs text-gray-500">Total deal amount in current slice</div>
      {byRegion.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">
          No deals match this filter.
        </div>
      ) : (
        <BarChart
          data={byRegion}
          index="region"
          categories={['amount']}
          valueFormatter={usd}
          className="mt-6 h-64"
          yAxisWidth={70}
        />
      )}
    </Card>
  );
}

function WinRateTable({ rows }) {
  const winRates = useMemo(() => {
    const byRep = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = byRep.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      byRep.set(r.rep, entry);
    }
    return Array.from(byRep.values())
      .map((e) => ({ rep: e.rep, winRate: e.closed > 0 ? e.won / e.closed : 0, closed: e.closed }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
      <div className="text-xs text-gray-500">Share of closed deals won, among Closed Won and Closed Lost in the current slice</div>
      {winRates.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">
          No closed deals match this filter.
        </div>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Closed deals</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winRates.map((r) => (
              <TableRow key={r.rep}>
                <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
                <TableCell className="text-right tabular-nums">{(r.winRate * 100).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Deal amount by region</h1>
      <p className="text-sm text-gray-500">Filter the 200-deal synthetic dataset by stage and see where amount concentrates.</p>

      {refreshing ? <p role="status" className="mt-2 text-sm text-gray-500">Updating...</p> : null}

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="mt-4 h-72 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button className="mt-2" onClick={retry}>Retry</Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <FilterBar stage={stage} setStage={setStage} stages={stages} />
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="winrate">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <RegionChart rows={filtered} />
            </TabsContent>
            <TabsContent value="winrate">
              <WinRateTable rows={filtered} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
