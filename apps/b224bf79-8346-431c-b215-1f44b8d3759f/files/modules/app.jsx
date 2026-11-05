import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHead, TableBody, TableRow, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { currency, compactCurrency } from './lib/format.js';
import { StageFilter } from './components/stage-filter.jsx';

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
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [filtered]);

  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + r.amount, 0),
    [filtered],
  );

  const winRateByRep = useMemo(() => {
    const closed = rows.filter((r) => r.stage === 'Won' || r.stage === 'Lost');
    const totals = new Map();
    for (const r of closed) {
      const entry = totals.get(r.rep) || { rep: r.rep, won: 0, total: 0 };
      entry.total += 1;
      if (r.stage === 'Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals.values())
      .map((e) => ({ ...e, winRate: e.total ? (e.won / e.total) * 100 : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">Filter deals by stage to see how total amount shifts across regions.</p>
        </div>
        {!loading && !error ? (
          <StageFilter stage={stage} stages={stages} onChange={setStage} />
        ) : null}
      </div>

      {refreshing ? (
        <p role="status" className="mt-2 text-sm text-gray-500">Updating…</p>
      ) : null}

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>Retry</Button>
        </div>
      ) : byRegion.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">No deals match this stage.</div>
      ) : (
        <Tabs defaultValue="region" className="mt-6">
          <TabsList>
            <TabsTrigger value="region">Amount by region</TabsTrigger>
            <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <div className="ana-figure ana-brackets mt-6">
              <span className="ana-figure__label">total amount · {stage === 'all' ? 'all stages' : stage}</span>
              <div className="ana-figure__value">{currency(total)}</div>
              <span className="ana-figure__note">{filtered.length} deals</span>
            </div>

            <Card className="mt-6">
              <div className="font-mono text-xs uppercase tracking-wide text-gray-500">amount by region</div>
              <BarChart
                data={byRegion}
                index="region"
                categories={['amount']}
                valueFormatter={compactCurrency}
                className="mt-4 h-72"
                yAxisWidth={60}
              />
            </Card>
          </TabsContent>
          <TabsContent value="reps">
            <Card className="mt-6">
              <div className="font-mono text-xs uppercase tracking-wide text-gray-500">win rate by rep</div>
              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    <TableCell className="font-medium text-gray-500">Rep</TableCell>
                    <TableCell className="text-right font-medium text-gray-500">Won</TableCell>
                    <TableCell className="text-right font-medium text-gray-500">Closed</TableCell>
                    <TableCell className="text-right font-medium text-gray-500">Win rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {winRateByRep.map((r) => (
                    <TableRow key={r.rep}>
                      <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.total}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
