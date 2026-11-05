import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { usd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

const STAGES = ['Prospecting', 'Negotiation', 'Won', 'Lost'];

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          {STAGES.map((s) => (
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
  const data = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => data.reduce((s, d) => s + d.amount, 0), [data]);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 mt-6">No deals match this filter.</p>;
  }

  return (
    <>
      <div className="mt-6 flex items-baseline gap-2.5">
        <span className="font-mono text-3xl tabular-nums text-gray-900">{usd(total)}</span>
        <span className="text-sm text-gray-500">total amount</span>
      </div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={usd}
        className="mt-6 h-72"
        yAxisWidth={70}
      />
    </>
  );
}

function WinRateTable({ rows }) {
  const data = useMemo(() => {
    const byRep = new Map();
    for (const r of rows) {
      if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
      const entry = byRep.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Won') entry.won += 1;
      byRep.set(r.rep, entry);
    }
    return Array.from(byRep.values())
      .map((e) => ({ ...e, winRate: e.won / e.closed }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 mt-6">No closed deals match this filter.</p>;
  }

  return (
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
        {data.map((r) => (
          <TableRow key={r.rep}>
            <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{r.won}</TableCell>
            <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
            <TableCell className="text-right tabular-nums">{(r.winRate * 100).toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const filtered = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">200 synthetic deals, filterable by stage</p>
        </div>
      </div>
      <Card className="mt-6">
        <FilterBar stage={stage} setStage={setStage} />
        {loading ? (
          <div role="status" aria-label="Loading deals">
            <Skeleton className="mt-6 h-72 w-full" />
          </div>
        ) : error ? (
          <div role="alert" className="mt-6">
            <p className="text-sm text-gray-500">Deals could not be loaded.</p>
            <Button className="mt-2" onClick={retry}>Retry</Button>
          </div>
        ) : (
          <Tabs defaultValue="region">
            <TabsList className="mt-6">
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
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
