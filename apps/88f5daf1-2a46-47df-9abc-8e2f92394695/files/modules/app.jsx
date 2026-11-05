import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd, usdFull } from './lib/format.js';

const STAGES = ['All', 'Won', 'Lost', 'Open'];

function aggregateByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    const prev = totals.get(r.region) || 0;
    totals.set(r.region, prev + Number(r.amount || 0));
  }
  return Array.from(totals.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function RegionBarChart({ loading, refreshing, error, retry, rows, stage }) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading amount by region">
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex h-60 flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">Deal data could not be loaded.</p>
        <button
          className="border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          onClick={retry}
        >
          Retry
        </button>
      </div>
    );
  }
  const filtered = useMemoFilter(rows, stage);
  const data = aggregateByRegion(filtered);
  const total = data.reduce((sum, r) => sum + r.amount, 0);
  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-gray-500">
        No deals match this filter.
      </div>
    );
  }
  return (
    <div>
      {refreshing ? (
        <p role="status" className="mb-2 text-sm text-gray-500">
          Updating...
        </p>
      ) : null}
      <div className="ana-figure">
        <span className="ana-figure__label">total amount · {stage === 'All' ? 'all stages' : stage.toLowerCase()}</span>
        <div className="ana-figure__value">{usdFull(total)}</div>
      </div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={usd}
        colors={['accent']}
        className="mt-6 h-60"
        yAxisWidth={60}
      />
    </div>
  );
}

function useMemoFilter(rows, stage) {
  return useMemo(() => {
    if (stage === 'All') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);
}

function computeWinRateByRep(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const prev = counts.get(r.rep) || { won: 0, closed: 0 };
    prev.closed += 1;
    if (r.stage === 'Won') prev.won += 1;
    counts.set(r.rep, prev);
  }
  return Array.from(counts.entries())
    .map(([rep, { won, closed }]) => ({
      rep,
      won,
      closed,
      winRate: closed > 0 ? won / closed : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

function RepWinRateTable({ loading, error, retry, rows }) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading win rate by rep">
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex h-60 flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">Deal data could not be loaded.</p>
        <button
          className="border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          onClick={retry}
        >
          Retry
        </button>
      </div>
    );
  }
  const data = computeWinRateByRep(rows);
  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-gray-500">
        No closed deals to compute win rate.
      </div>
    );
  }
  return (
    <Table>
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
            <TableCell className="text-right tabular-nums">
              {(r.winRate * 100).toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All');
  const [tab, setTab] = useState('region');

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <div className="mt-2">
        <h1 className="text-lg font-semibold text-gray-900">Deal performance</h1>
        <p className="text-sm text-gray-500">200 synthetic deals across region, rep, and stage.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-gray-500">Filter the deals by stage.</p>
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
          </div>
          <Card className="mt-4">
            <RegionBarChart
              loading={loading}
              refreshing={refreshing}
              error={error}
              retry={retry}
              rows={rows || []}
              stage={stage}
            />
          </Card>
        </TabsContent>
        <TabsContent value="reps">
          <p className="mt-4 text-sm text-gray-500">
            Won / (Won + Lost) across all closed deals, by rep.
          </p>
          <Card className="mt-4">
            <RepWinRateTable loading={loading} error={error} retry={retry} rows={rows || []} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
