import { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Card,
  BarChart,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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

const deals = ana.data.get('deals') || [];

const currency = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

const STAGES = Array.from(new Set(deals.map((d) => d.stage))).sort();

const percent = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(v);

function winRateByRep(rows) {
  const closed = rows.filter(
    (d) => d.stage === 'Closed Won' || d.stage === 'Closed Lost'
  );
  const counts = new Map();
  for (const r of closed) {
    const entry = counts.get(r.rep) || { won: 0, total: 0 };
    entry.total += 1;
    if (r.stage === 'Closed Won') entry.won += 1;
    counts.set(r.rep, entry);
  }
  return Array.from(counts.entries())
    .map(([rep, { won, total }]) => ({
      rep,
      won,
      total,
      winRate: total > 0 ? won / total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

function amountByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
  }
  return Array.from(totals.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function FilterBar({ stage, setStage }) {
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
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {stage !== 'all' ? (
        <Button variant="light" onClick={() => setStage('all')}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}

function RegionChart({ rows }) {
  const data = useMemo(() => amountByRegion(rows), [rows]);
  const total = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);

  if (rows.length === 0) {
    return (
      <Card>
        <div className="text-sm text-gray-500">
          No deals match this filter. Try resetting it.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-sm text-gray-500">Amount by region</div>
      <div className="mt-1 font-mono text-2xl tabular-nums text-gray-900">
        {currency(total)}
      </div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={currency}
        colors={['accent']}
        className="mt-6 h-72"
        yAxisWidth={70}
      />
    </Card>
  );
}

function WinRateTable() {
  const data = useMemo(() => winRateByRep(deals), []);

  if (data.length === 0) {
    return (
      <Card>
        <div className="text-sm text-gray-500">No closed deals yet.</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-sm text-gray-500">Win rate by rep</div>
      <div className="mt-1 text-xs text-gray-500">
        Based on closed deals (Closed Won vs. Closed Lost)
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Won</TableHead>
            <TableHead className="text-right">Closed deals</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.rep}>
              <TableCell className="font-medium text-gray-900">
                {r.rep}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.won}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.total}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {percent(r.winRate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function App() {
  const [stage, setStage] = useState('all');
  const [view, setView] = useState('region');

  const filtered = useMemo(
    () => (stage === 'all' ? deals : deals.filter((d) => d.stage === stage)),
    [stage]
  );

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">rc9 probe lemur</div>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">
          Sales deal explorer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          200 synthetic deals, filterable by stage. Snapshot as of publish.
        </p>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <div className="mt-6 space-y-6">
            <FilterBar stage={stage} setStage={setStage} />
            <RegionChart rows={filtered} />
          </div>
        </TabsContent>
        <TabsContent value="reps">
          <div className="mt-6">
            <WinRateTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
