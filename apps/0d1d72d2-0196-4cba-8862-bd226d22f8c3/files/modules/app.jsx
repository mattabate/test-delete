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
  Button,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from 'tremor';
import { useSource } from './hooks/use-source.js';
import { usd } from './lib/format.js';

const STAGES = ['All', 'Won', 'Lost', 'Open'];

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
          Stage
        </span>
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
    for (const row of rows) {
      totals.set(row.region, (totals.get(row.region) || 0) + row.amount);
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
      <div className="mt-2 text-2xl font-semibold text-gray-900">
        {usd(total)}
      </div>
      {byRegion.length ? (
        <BarChart
          data={byRegion}
          index="region"
          categories={['amount']}
          valueFormatter={usd}
          className="mt-6 h-64"
          yAxisWidth={70}
        />
      ) : (
        <p className="mt-6 text-sm text-gray-500">
          No deals match this filter.
        </p>
      )}
    </Card>
  );
}

function WinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const totals = new Map();
    for (const row of rows) {
      if (row.stage !== 'Won' && row.stage !== 'Lost') continue;
      const entry = totals.get(row.rep) || { won: 0, closed: 0 };
      entry.closed += 1;
      if (row.stage === 'Won') entry.won += 1;
      totals.set(row.rep, entry);
    }
    return Array.from(totals, ([rep, { won, closed }]) => ({
      rep,
      won,
      closed,
      winRate: closed ? (won / closed) * 100 : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        Win rate by rep
      </div>
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
              <TableCell className="font-medium text-gray-900">
                {r.rep}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.won}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.closed}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.winRate.toFixed(1)}%
              </TableCell>
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
    if (stage === 'All') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">sales deals</div>
        <h1 className="text-lg font-semibold text-gray-900">
          Sales deals explorer
        </h1>
        <p className="text-sm text-gray-500">
          200 synthetic deals across region, rep, and stage.
        </p>
      </div>
      <FilterBar stage={stage} setStage={setStage} />
      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="h-72 w-full" />
        </div>
      ) : error ? (
        <div role="alert">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      ) : (
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">Amount by region</TabsTrigger>
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
