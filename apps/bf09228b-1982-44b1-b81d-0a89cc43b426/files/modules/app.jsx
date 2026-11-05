import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { usd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

const STAGES = ['All', 'Won', 'Lost', 'Open'];

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">Stage</div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {stage !== 'All' ? (
        <Button variant="light" onClick={() => setStage('All')}>Reset</Button>
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
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        Amount by region
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 font-mono tabular-nums">
        {usd(total)}
      </div>
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
  const byRep = useMemo(() => {
    const counts = new Map();
    for (const r of rows) {
      if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
      const entry = counts.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Won') entry.won += 1;
      counts.set(r.rep, entry);
    }
    return Array.from(counts.values())
      .map((e) => ({ ...e, winRate: e.closed ? (e.won / e.closed) * 100 : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        Win rate by rep
      </div>
      {byRep.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">
          No closed deals match this filter.
        </div>
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
      )}
    </Card>
  );
}

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'All' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Deal amount by region</h1>
      <p className="text-sm text-gray-500">Filter the 200 synthetic deals by stage to see how amount by region shifts.</p>
      <div className="mt-6">
        <FilterBar stage={stage} setStage={setStage} />
      </div>
      <div className="mt-8">
        {loading ? (
          <div role="status" aria-label="Loading deals">
            <Skeleton className="h-72 w-full" />
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-gray-700">Deals could not be loaded.</p>
            <Button className="mt-3" onClick={retry}>Retry</Button>
          </Card>
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
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
