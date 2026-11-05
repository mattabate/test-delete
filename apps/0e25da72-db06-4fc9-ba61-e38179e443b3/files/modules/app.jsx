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
import { usd } from './lib/format.js';

const STAGES = ['Closed Won', 'Closed Lost', 'Negotiation', 'Proposal', 'Qualification'];

function regionTotals(rows) {
  const totals = new Map();
  for (const row of rows) {
    totals.set(row.region, (totals.get(row.region) || 0) + Number(row.amount));
  }
  return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}

function winRateByRep(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (row.stage !== 'Closed Won' && row.stage !== 'Closed Lost') continue;
    const entry = counts.get(row.rep) || { won: 0, total: 0 };
    entry.total += 1;
    if (row.stage === 'Closed Won') entry.won += 1;
    counts.set(row.rep, entry);
  }
  return Array.from(counts, ([rep, { won, total }]) => ({
    rep,
    winRate: total ? (won / total) * 100 : 0,
    closed: total,
  })).sort((a, b) => b.winRate - a.winRate);
}

function WinRateTable({ rows }) {
  const data = useMemo(() => winRateByRep(rows), [rows]);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rep</TableHead>
          <TableHead className="text-right">Closed deals</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => (
          <TableRow key={r.rep}>
            <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
            <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StageFilter({ stage, onChange }) {
  return (
    <Select value={stage} onValueChange={onChange}>
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
  );
}

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'all' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const chartData = useMemo(() => regionTotals(filtered), [filtered]);
  const total = useMemo(() => chartData.reduce((sum, r) => sum + r.amount, 0), [chartData]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>

      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="mt-6 h-80 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <button className="mt-2 text-sm text-indigo-600" onClick={retry}>
            Retry
          </button>
        </Card>
      ) : (
        <Tabs defaultValue="region" className="mt-4">
          <TabsList>
            <TabsTrigger value="region">Amount by region</TabsTrigger>
            <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
                <p className="text-sm text-gray-500">Filter the 200 synthetic deals by stage.</p>
              </div>
              <StageFilter stage={stage} onChange={setStage} />
            </div>
            {chartData.length === 0 ? (
              <Card className="mt-6">
                <p className="text-sm text-gray-500">No deals match this stage.</p>
              </Card>
            ) : (
              <Card className="mt-6">
                <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
                  total amount{stage !== 'all' ? ` \u00b7 ${stage}` : ''}
                </div>
                <div className="mt-1 font-mono text-3xl tabular-nums text-gray-900">{usd(total)}</div>
                <BarChart
                  data={chartData}
                  index="region"
                  categories={['amount']}
                  valueFormatter={usd}
                  colors={['accent']}
                  className="mt-6 h-72"
                />
              </Card>
            )}
          </TabsContent>
          <TabsContent value="reps">
            <div className="mt-4">
              <h1 className="text-lg font-semibold text-gray-900">Win rate by rep</h1>
              <p className="text-sm text-gray-500">Share of each rep's closed deals that were won.</p>
            </div>
            <Card className="mt-6">
              <WinRateTable rows={rows || []} />
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
