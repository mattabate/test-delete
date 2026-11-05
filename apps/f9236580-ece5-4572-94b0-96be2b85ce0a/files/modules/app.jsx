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
import { usd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

const STAGES = ['Prospecting', 'Negotiation', 'Won', 'Lost'];

function byRegion(rows) {
  const totals = new Map();
  for (const row of rows) {
    totals.set(row.region, (totals.get(row.region) || 0) + row.amount);
  }
  return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}

function winRateByRep(rows) {
  const closed = new Map();
  for (const row of rows) {
    if (row.stage !== 'Won' && row.stage !== 'Lost') continue;
    const entry = closed.get(row.rep) || { won: 0, total: 0 };
    entry.total += 1;
    if (row.stage === 'Won') entry.won += 1;
    closed.set(row.rep, entry);
  }
  return Array.from(closed, ([rep, { won, total }]) => ({
    rep,
    won,
    total,
    winRate: total ? (won / total) * 100 : 0,
  })).sort((a, b) => b.winRate - a.winRate);
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'all' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const chartData = useMemo(() => byRegion(filtered), [filtered]);
  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + r.amount, 0),
    [filtered],
  );
  const repWinRates = useMemo(() => winRateByRep(filtered), [filtered]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Amount by region
          </h1>
          <p className="text-sm text-gray-500">
            Total deal amount grouped by region, filterable by stage.
          </p>
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Stage" />
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
      ) : chartData.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-500">
            No deals match this stage filter.
          </p>
        </Card>
      ) : (
        <>
          {refreshing ? (
            <p role="status" className="mt-4 text-sm text-gray-500">
              Updating…
            </p>
          ) : null}
          <Tabs defaultValue="region" className="mt-6">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <div className="ana-figure mt-6">
                <span className="ana-figure__label">
                  total amount · filtered
                </span>
                <div className="ana-figure__value">{usd(total)}</div>
              </div>
              <Card className="mt-6">
                <BarChart
                  data={chartData}
                  index="region"
                  categories={['amount']}
                  valueFormatter={usd}
                  className="mt-4 h-72"
                  yAxisWidth={70}
                />
              </Card>
            </TabsContent>
            <TabsContent value="reps">
              <Card className="mt-6">
                {repWinRates.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No closed (Won/Lost) deals match this stage filter.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rep</TableHead>
                        <TableHead className="text-right">Won</TableHead>
                        <TableHead className="text-right">Closed</TableHead>
                        <TableHead className="text-right">
                          Win rate
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repWinRates.map((r) => (
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
                            {r.winRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
