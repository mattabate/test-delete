import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart,
  Button,
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
import { currency } from './lib/format.js';

function FilterBar({ stage, setStage, stages, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
          Stage
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {stage !== 'all' ? (
        <Button variant="light" onClick={onReset}>
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
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [rows]);

  const total = byRegion.reduce((s, r) => s + r.amount, 0);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        total amount by region
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
        {currency(total)}
      </div>
      {byRegion.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No deals match this filter.
        </p>
      ) : (
        <BarChart
          data={byRegion}
          index="region"
          categories={['amount']}
          valueFormatter={currency}
          className="mt-6 h-72"
          yAxisWidth={70}
        />
      )}
    </Card>
  );
}

function WinRateByRep({ rows }) {
  const byRep = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = totals.get(r.rep) || { won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals, ([rep, { won, closed }]) => ({
      rep,
      won,
      closed,
      winRate: closed > 0 ? won / closed : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        win rate by rep
      </div>
      {byRep.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No closed deals match this filter.
        </p>
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
                  {(r.winRate * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">sales deals explorer</div>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">
          Amount by region
        </h1>
        <p className="text-sm text-gray-500">
          200 synthetic deals, filterable by stage.
        </p>
        {refreshing ? (
          <p role="status" className="text-sm text-gray-500 mt-1">
            Updating…
          </p>
        ) : null}
      </div>

      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      ) : (
        <>
          <FilterBar
            stage={stage}
            setStage={setStage}
            stages={stages}
            onReset={() => setStage('all')}
          />
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <RegionChart rows={filteredRows} />
            </TabsContent>
            <TabsContent value="reps">
              <WinRateByRep rows={filteredRows} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
