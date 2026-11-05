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
      const region = r.region;
      const amount = Number(r.amount) || 0;
      totals.set(region, (totals.get(region) || 0) + amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => byRegion.reduce((sum, r) => sum + r.amount, 0), [byRegion]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Total amount by region</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{usd(total)}</div>
      {byRegion.length ? (
        <BarChart
          data={byRegion}
          index="region"
          categories={['amount']}
          valueFormatter={usd}
          className="mt-6 h-72"
        />
      ) : (
        <div className="mt-6 text-sm text-gray-500">No deals match this filter.</div>
      )}
    </Card>
  );
}

function WinRateTable({ rows }) {
  const winRates = useMemo(() => {
    const byRep = new Map();
    for (const r of rows) {
      if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
      const rep = r.rep;
      const entry = byRep.get(rep) || { won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Won') entry.won += 1;
      byRep.set(rep, entry);
    }
    return Array.from(byRep, ([rep, { won, closed }]) => ({
      rep,
      won,
      closed,
      winRate: closed ? (won / closed) * 100 : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Win rate by rep</div>
      {winRates.length ? (
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
      ) : (
        <div className="mt-4 text-sm text-gray-500">No closed deals match this filter.</div>
      )}
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
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">sales deals</div>
        <h1 className="text-lg font-semibold text-gray-900">Deals by region</h1>
        <p className="text-sm text-gray-500">Synthetic test dataset: 200 deals across region, rep, stage, amount, close month.</p>
      </div>
      <FilterBar stage={stage} setStage={setStage} stages={stages} />
      {loading ? (
        <div role="status" aria-label="Loading deals"><Skeleton className="h-80 w-full" /></div>
      ) : error ? (
        <div role="alert" className="h-80">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      ) : (
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">By region</TabsTrigger>
            <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <RegionChart rows={filtered} />
          </TabsContent>
          <TabsContent value="reps">
            <WinRateTable rows={filtered} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
