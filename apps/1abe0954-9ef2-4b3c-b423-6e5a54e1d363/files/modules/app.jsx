import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from 'tremor';
import { currency, compactCurrency } from './lib/format.js';
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
      {stage !== 'All' && (
        <Button variant="light" onClick={() => setStage('All')}>Reset</Button>
      )}
    </div>
  );
}

function RegionChart({ rows }) {
  const byRegion = useMemo(() => {
    const totals = {};
    rows.forEach((r) => {
      totals[r.region] = (totals[r.region] || 0) + r.amount;
    });
    return Object.entries(totals)
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.amount, 0), [rows]);

  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Amount by region</div>
      <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-gray-900">
        {currency(total)}
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
          valueFormatter={compactCurrency}
          className="mt-6 h-64"
          yAxisWidth={70}
        />
      )}
    </Card>
  );
}

function WinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const totals = {};
    rows.forEach((r) => {
      if (r.stage !== 'Won' && r.stage !== 'Lost') return;
      if (!totals[r.rep]) totals[r.rep] = { rep: r.rep, won: 0, closed: 0 };
      totals[r.rep].closed += 1;
      if (r.stage === 'Won') totals[r.rep].won += 1;
    });
    return Object.values(totals)
      .map((t) => ({ ...t, winRate: t.closed ? t.won / t.closed : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
      <p className="text-sm text-gray-500">Won deals divided by closed (won + lost) deals.</p>
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
                <TableCell className="text-right font-mono tabular-nums">{r.won}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.closed}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{(r.winRate * 100).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function App() {
  const { rows: allRows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All');

  const rows = useMemo(() => {
    const all = allRows || [];
    return stage === 'All' ? all : all.filter((r) => r.stage === stage);
  }, [allRows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Deals by region</h1>
          <p className="text-sm text-gray-500">Synthetic dataset of 200 deals, filterable by stage.</p>
        </div>
        <FilterBar stage={stage} setStage={setStage} />
      </div>
      <div className="mt-8">
        {loading ? (
          <div role="status" aria-label="Loading deals">
            <Skeleton className="h-72 w-full" />
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-gray-700">Deals data could not be loaded.</p>
            <Button className="mt-3" onClick={retry}>Retry</Button>
          </Card>
        ) : (
          <>
            {refreshing && <p role="status" className="text-sm text-gray-500 mb-2">Updating…</p>}
            <Tabs defaultValue="region">
              <TabsList>
                <TabsTrigger value="region">By region</TabsTrigger>
                <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
              </TabsList>
              <TabsContent value="region">
                <RegionChart rows={rows} />
              </TabsContent>
              <TabsContent value="reps">
                <WinRateTable rows={rows} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
