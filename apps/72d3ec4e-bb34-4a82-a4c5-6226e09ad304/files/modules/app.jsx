import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd, compactUsd } from './lib/format.js';

const STAGES = ['All', 'Won', 'Lost', 'Open'];

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          {STAGES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
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
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => byRegion.reduce((sum, r) => sum + r.amount, 0), [byRegion]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Amount by region</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">{usd(total)}</div>
      {byRegion.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No deals match this filter.</p>
      ) : (
        <BarChart
          data={byRegion}
          index="region"
          categories={['amount']}
          valueFormatter={compactUsd}
          className="mt-6 h-72"
          yAxisWidth={70}
        />
      )}
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
      .map((e) => ({ ...e, winRate: e.closed ? e.won / e.closed : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Win rate by rep</div>
      <p className="mt-1 text-sm text-gray-500">Won divided by closed (Won + Lost) deals per rep.</p>
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
  const [stage, setStage] = useState('All');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'All' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Deal amount by region</h1>
      <p className="text-sm text-gray-500">Filter by stage to see how amount concentrates by region.</p>

      <div className="mt-6">
        <FilterBar stage={stage} setStage={setStage} />
      </div>

      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading deals">
            <Skeleton className="h-80 w-full" />
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-gray-700">Deals could not be loaded.</p>
            <Button className="mt-3" onClick={retry}>
              Retry
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <div className="mt-6">
                <RegionChart rows={filtered} />
              </div>
            </TabsContent>
            <TabsContent value="reps">
              <div className="mt-6">
                <WinRateTable rows={rows} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
