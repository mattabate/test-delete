import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd } from './lib/format.js';

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
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {stage !== 'All' ? (
        <Button variant="light" onClick={() => setStage('All')}>Reset</Button>
      ) : null}
    </div>
  );
}

function AmountByRegionChart({ rows }) {
  const data = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.amount, 0), [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Amount by region</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 font-mono tabular-nums">{usd(total)}</div>
      {data.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">No deals match this filter.</div>
      ) : (
        <BarChart
          data={data}
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

function WinRateByRepTable({ rows }) {
  const data = useMemo(() => {
    const closed = rows.filter((r) => r.stage === 'Won' || r.stage === 'Lost');
    const totals = new Map();
    for (const r of closed) {
      const entry = totals.get(r.rep) || { won: 0, total: 0 };
      entry.total += 1;
      if (r.stage === 'Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals, ([rep, { won, total }]) => ({
      rep,
      won,
      total,
      winRate: total > 0 ? (won / total) * 100 : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Win rate by rep</div>
      {data.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">No closed deals yet.</div>
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
            {data.map((d) => (
              <TableRow key={d.rep}>
                <TableCell className="font-medium text-gray-900">{d.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{d.won}</TableCell>
                <TableCell className="text-right tabular-nums">{d.total}</TableCell>
                <TableCell className="text-right tabular-nums">{d.winRate.toFixed(1)}%</TableCell>
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
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Deal amounts by region</h1>
      <p className="text-sm text-gray-500">Filter the 200 synthetic deals by stage to see total amount per region.</p>
      <div className="mt-6">
        <FilterBar stage={stage} setStage={setStage} />
      </div>
      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading deals"><Skeleton className="h-64 w-full" /></div>
        ) : error ? (
          <Card>
            <p className="text-sm text-gray-500">Deals could not be loaded.</p>
            <Button className="mt-3" onClick={retry}>Retry</Button>
          </Card>
        ) : (
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <div className="mt-6">
                <AmountByRegionChart rows={filtered} />
              </div>
            </TabsContent>
            <TabsContent value="reps">
              <div className="mt-6">
                <WinRateByRepTable rows={filtered} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
