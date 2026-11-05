import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd, compactUsd } from './lib/format.js';

const STAGES = ['All', 'Won', 'Lost', 'Open'];

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          {STAGES.map((s) => (
            <SelectItem key={s} value={s}>
              {s === 'All' ? 'All stages' : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {stage !== 'All' ? (
        <Button variant="light" onClick={() => setStage('All')}>
          Reset
        </Button>
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
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [rows]);

  const total = byRegion.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-gray-900">Amount by region</div>
        <div className="font-mono text-sm text-gray-500">{rows.length} deals</div>
      </div>
      <div className="ana-figure mt-2">
        <span className="ana-figure__label">total amount</span>
        <div className="ana-figure__value">{compactUsd(total)}</div>
      </div>
      <BarChart
        data={byRegion}
        index="region"
        categories={['amount']}
        valueFormatter={compactUsd}
        className="mt-6 h-72"
        yAxisWidth={60}
      />
    </Card>
  );
}

function WinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
      const entry = totals.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals.values())
      .map((e) => ({ ...e, winRate: e.closed ? (e.won / e.closed) * 100 : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
      <p className="text-sm text-gray-500">Won divided by closed (won + lost) deals</p>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Won</TableHead>
            <TableHead className="text-right">Closed</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {byRep.map((r) => (
            <TableRow key={r.rep}>
              <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
              <TableCell className="text-right tabular-nums">{r.won}</TableCell>
              <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
              <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function Page() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'All' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Deal amount by region</h1>
          <p className="text-sm text-gray-500">200 synthetic sales deals, filterable by stage</p>
        </div>
        <FilterBar stage={stage} setStage={setStage} />
      </div>

      <div className="mt-8">
        {loading ? (
          <div role="status" aria-label="Loading deals">
            <Skeleton className="h-80 w-full" />
          </div>
        ) : error ? (
          <Card role="alert">
            <p className="text-sm text-gray-700">Deals could not be loaded.</p>
            <Button className="mt-3" onClick={retry}>
              Retry
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500">No deals match this filter.</p>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Page />);
