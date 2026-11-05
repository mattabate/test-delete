import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Skeleton, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd, compactUsd } from './lib/format.js';

function FilterBar({ stage, setStage, stages, count }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">Stage</div>
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
      </div>
      <Button variant="light" onClick={() => setStage('all')} disabled={stage === 'all'}>
        Reset{stage !== 'all' ? ' (1)' : ''}
      </Button>
      <div className="ml-auto text-sm text-gray-500">{count} deals in view</div>
    </div>
  );
}

function RegionChart({ data, total }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Amount by region</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{usd(total)}</div>
      {data.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">
          No deals match this filter.
        </div>
      ) : (
        <BarChart
          data={data}
          index="region"
          categories={['amount']}
          valueFormatter={compactUsd}
          className="mt-6 h-64"
          yAxisWidth={60}
        />
      )}
    </Card>
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
      .map((e) => ({ ...e, winRate: e.closed ? (e.won / e.closed) * 100 : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Win rate by rep</div>
      <Table className="mt-4">
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
              <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function Shell() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.stage))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'all' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals.entries())
      .map(([region, amount]) => ({ region, amount: Math.round(amount) }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const total = useMemo(() => byRegion.reduce((sum, r) => sum + r.amount, 0), [byRegion]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">sales deals explorer</div>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">Deal amount by region</h1>
        <p className="text-sm text-gray-500">Filter the 200 synthetic deals by stage to see how amount concentrates by region.</p>
      </div>
      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <Card>
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>Retry</Button>
        </Card>
      ) : (
        <>
          {refreshing && <p role="status" className="text-sm text-gray-500">Updating...</p>}
          <Tabs defaultValue="by-region">
            <TabsList>
              <TabsTrigger value="by-region">By region</TabsTrigger>
              <TabsTrigger value="by-rep">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="by-region">
              <div className="space-y-8 mt-6">
                <FilterBar stage={stage} setStage={setStage} stages={stages} count={filtered.length} />
                <RegionChart data={byRegion} total={total} />
              </div>
            </TabsContent>
            <TabsContent value="by-rep">
              <div className="mt-6">
                <WinRateTable rows={rows} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Shell />);
