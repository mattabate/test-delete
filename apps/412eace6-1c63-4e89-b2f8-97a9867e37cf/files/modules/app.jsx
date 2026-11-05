import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { currency } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

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
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [rows]);

  const total = byRegion.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        Total amount by region
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{currency(total)}</div>
      <BarChart
        data={byRegion}
        index="region"
        categories={['amount']}
        valueFormatter={currency}
        className="mt-6 h-64"
        yAxisWidth={70}
      />
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
      .map((e) => ({ rep: e.rep, winRate: e.closed ? e.won / e.closed : 0, closed: e.closed }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        Win rate by rep
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Closed deals</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {byRep.map((r) => (
            <TableRow key={r.rep}>
              <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
              <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
              <TableCell className="text-right tabular-nums">{(r.winRate * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
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

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-1">Deal amount by region</h1>
      <p className="text-sm text-gray-500">Filter the 200 synthetic deals by stage and see total amount per region.</p>

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button onClick={retry} className="mt-2">Retry</Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">By region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <div className="mt-6 space-y-6">
                <FilterBar stage={stage} setStage={setStage} stages={stages} />
                <RegionChart rows={filtered} />
              </div>
            </TabsContent>
            <TabsContent value="reps">
              <div className="mt-6">
                <WinRateTable rows={rows} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
