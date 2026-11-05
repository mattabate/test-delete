import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart,
  Card,
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
import { compactCurrency, currency } from './lib/format.js';
import { StageFilter } from './components/stage-filter.jsx';

function Shell({ children }) {
  return <div className="mx-auto max-w-5xl p-6">{children}</div>;
}

function RegionChart({ rows, stage }) {
  const stages = useMemo(
    () => Array.from(new Set(rows.map((r) => r.stage))).sort(),
    [rows],
  );

  const filtered = useMemo(
    () => (stage === 'all' ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [filtered]);

  const total = useMemo(
    () => byRegion.reduce((sum, r) => sum + r.amount, 0),
    [byRegion],
  );

  return { stages, byRegion, total, filteredCount: filtered.length };
}

function RegionTab({ rows }) {
  const [stage, setStage] = useState('all');
  const { stages, byRegion, total, filteredCount } = RegionChart({ rows, stage });

  return (
    <>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">
            {filteredCount} deals · total {currency(total)}
          </p>
        </div>
        <StageFilter value={stage} onValueChange={setStage} stages={stages} />
      </div>
      <Card className="mt-6">
        {byRegion.length === 0 ? (
          <p className="text-sm text-gray-500">No deals match this filter.</p>
        ) : (
          <BarChart
            data={byRegion}
            index="region"
            categories={['amount']}
            valueFormatter={compactCurrency}
            className="h-72"
            yAxisWidth={60}
          />
        )}
      </Card>
    </>
  );
}

function winRateByRep(rows) {
  const totals = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const entry = totals.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
    entry.closed += 1;
    if (r.stage === 'Won') entry.won += 1;
    totals.set(r.rep, entry);
  }
  return Array.from(totals.values())
    .map((e) => ({ ...e, winRate: e.closed ? (e.won / e.closed) * 100 : 0 }))
    .sort((a, b) => b.winRate - a.winRate);
}

function RepsTab({ rows }) {
  const data = useMemo(() => winRateByRep(rows), [rows]);

  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold text-gray-900">Win rate by rep</h1>
      <p className="text-sm text-gray-500">Won / (Won + Lost) closed deals</p>
      <Card className="mt-6">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">No closed deals found.</p>
        ) : (
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
                  <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function DealsView({ rows }) {
  const [tab, setTab] = useState('region');

  return (
    <>
      <div className="ana-kicker">sales deals explorer</div>
      <Tabs value={tab} onValueChange={setTab} className="mt-2">
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <RegionTab rows={rows} />
        </TabsContent>
        <TabsContent value="reps">
          <RepsTab rows={rows} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');

  return (
    <Shell>
      {refreshing && (
        <p role="status" className="text-sm text-gray-500">Updating…</p>
      )}
      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="mt-4 h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-4">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button className="mt-2" onClick={retry}>Retry</Button>
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No deals found.</p>
      ) : (
        <DealsView rows={rows} />
      )}
    </Shell>
  );
}

createRoot(document.getElementById('root')).render(<App />);
