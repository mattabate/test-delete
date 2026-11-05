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
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'tremor';
import { useSource } from './hooks/use-source.js';
import { currency, compactCurrency } from './lib/format.js';

const ALL_STAGES = '__all__';

function FilterBar({ stage, setStage, stages }) {
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
            <SelectItem value={ALL_STAGES}>All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {stage !== ALL_STAGES ? (
        <Button variant="light" onClick={() => setStage(ALL_STAGES)}>
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
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals.entries())
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.amount, 0), [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        amount by region
      </div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {currency(total)}
      </div>
      <div className="mt-1 text-xs text-gray-500">{rows.length} deals in this slice</div>
      {byRegion.length === 0 ? (
        <div className="mt-6 flex h-48 items-center justify-center text-sm text-gray-500">
          No deals match this filter.
        </div>
      ) : (
        <BarChart
          data={byRegion}
          index="region"
          categories={['amount']}
          valueFormatter={compactCurrency}
          className="mt-6 h-64"
          yAxisWidth={60}
        />
      )}
    </Card>
  );
}

function WinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = totals.get(r.rep) || { won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals.entries())
      .map(([rep, { won, closed }]) => ({
        rep,
        won,
        closed,
        winRate: closed > 0 ? won / closed : 0,
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        win rate by rep
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Share of closed deals (won vs. lost) each rep has won.
      </p>
      {byRep.length === 0 ? (
        <div className="mt-6 flex h-48 items-center justify-center text-sm text-gray-500">
          No closed deals yet.
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
  const [stage, setStage] = useState(ALL_STAGES);

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (stage === ALL_STAGES) return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Deal pipeline by region</h1>
      <p className="mt-1 text-sm text-gray-500">
        200 synthetic deals. Filter by stage to see how regional totals shift.
      </p>

      {refreshing ? (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Updating...
        </p>
      ) : null}

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button className="mt-2" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <FilterBar stage={stage} setStage={setStage} stages={stages} />
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="winrate">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <RegionChart rows={filtered} />
            </TabsContent>
            <TabsContent value="winrate">
              <WinRateTable rows={rows} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
