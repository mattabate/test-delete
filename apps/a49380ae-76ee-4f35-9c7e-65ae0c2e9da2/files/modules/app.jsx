import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { usd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

function FilterBar({ stage, setStage, stages }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
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
      <Button variant="light" onClick={() => setStage('all')}>Reset</Button>
    </div>
  );
}

function RegionChart({ rows }) {
  const byRegion = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      map.set(r.region, (map.get(r.region) || 0) + r.amount);
    }
    return Array.from(map, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);
  const total = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">amount by region</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{usd(total)}</div>
      <BarChart
        data={byRegion}
        index="region"
        categories={['amount']}
        valueFormatter={usd}
        className="mt-6 h-72"
        yAxisWidth={70}
      />
    </Card>
  );
}

function WinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = map.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      map.set(r.rep, entry);
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, winRate: e.closed ? (e.won / e.closed) * 100 : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">win rate by rep</div>
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
              <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
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
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Deals by region</h1>
      </div>
      <Tabs defaultValue="region" className="mt-6">
        <TabsList>
          <TabsTrigger value="region">By region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <div className="mt-6">
            <FilterBar stage={stage} setStage={setStage} stages={stages} />
          </div>
          <div className="mt-6">
            {loading ? (
              <div role="status" aria-label="Loading deals"><Skeleton className="h-80 w-full" /></div>
            ) : error ? (
              <div role="alert" className="h-80">
                <p className="text-sm text-gray-500">Deals could not be loaded.</p>
                <Button onClick={retry}>Retry</Button>
              </div>
            ) : filtered.length === 0 ? (
              <Card><p className="text-sm text-gray-500">No deals match this filter.</p></Card>
            ) : (
              <RegionChart rows={filtered} />
            )}
          </div>
        </TabsContent>
        <TabsContent value="reps">
          <div className="mt-6">
            {loading ? (
              <div role="status" aria-label="Loading deals"><Skeleton className="h-80 w-full" /></div>
            ) : error ? (
              <div role="alert" className="h-80">
                <p className="text-sm text-gray-500">Deals could not be loaded.</p>
                <Button onClick={retry}>Retry</Button>
              </div>
            ) : (
              <WinRateTable rows={rows} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
