import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';

const currency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);

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
      {stage !== 'all' && (
        <Button variant="light" onClick={() => setStage('all')}>Reset</Button>
      )}
    </div>
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(
    () => (stage === 'all' ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );

  const byRegion = useMemo(() => {
    const totals = {};
    filtered.forEach((r) => {
      totals[r.region] = (totals[r.region] || 0) + Number(r.amount);
    });
    return Object.entries(totals)
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const total = useMemo(() => byRegion.reduce((acc, r) => acc + r.amount, 0), [byRegion]);

  const winRateByRep = useMemo(() => {
    const closed = filtered.filter((r) => r.stage === 'Won' || r.stage === 'Lost');
    const totals = {};
    closed.forEach((r) => {
      if (!totals[r.rep]) totals[r.rep] = { won: 0, total: 0 };
      totals[r.rep].total += 1;
      if (r.stage === 'Won') totals[r.rep].won += 1;
    });
    return Object.entries(totals)
      .map(([rep, v]) => ({ rep, winRate: v.total ? (v.won / v.total) * 100 : 0, deals: v.total }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">deal pipeline</div>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
        </div>
      </div>

      <FilterBar stage={stage} setStage={setStage} stages={stages} />

      {loading ? (
        <div role="status" aria-label="Loading deals"><Skeleton className="h-80 w-full" /></div>
      ) : error ? (
        <Card>
          <p role="alert" className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>Retry</Button>
        </Card>
      ) : byRegion.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No deals match this filter.</p>
          <Button className="mt-3" variant="light" onClick={() => setStage('all')}>Reset filter</Button>
        </Card>
      ) : (
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">By region</TabsTrigger>
            <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <Card>
              {refreshing && <p role="status" className="text-xs text-gray-500 mb-2">Updating...</p>}
              <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Total amount</div>
              <div className="font-mono text-3xl tabular-nums text-gray-900 mt-1">{currency(total)}</div>
              <BarChart
                data={byRegion}
                index="region"
                categories={['amount']}
                valueFormatter={currency}
                className="mt-6 h-72"
                yAxisWidth={60}
              />
            </Card>
          </TabsContent>
          <TabsContent value="reps">
            <Card>
              {refreshing && <p role="status" className="text-xs text-gray-500 mb-2">Updating...</p>}
              {winRateByRep.length === 0 ? (
                <p className="text-sm text-gray-500">No closed deals match this filter.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rep</TableHead>
                      <TableHead className="text-right">Closed deals</TableHead>
                      <TableHead className="text-right">Win rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winRateByRep.map((r) => (
                      <TableRow key={r.rep}>
                        <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.deals}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
