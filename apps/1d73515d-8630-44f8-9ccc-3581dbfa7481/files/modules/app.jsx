import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Tabs, TabsList, TabsTrigger, TabsContent, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useDeals } from './hooks/use-deals.js';
import { RegionChart } from './components/region-chart.jsx';

const REGION_ORDER = ['North', 'South', 'East', 'West'];

function byRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
  }
  return REGION_ORDER.filter((r) => totals.has(r)).map((region) => ({
    region,
    amount: totals.get(region),
  }));
}

function winRateByRep(deals) {
  const closed = new Map();
  for (const d of deals) {
    if (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost') continue;
    const entry = closed.get(d.rep) || { won: 0, total: 0 };
    entry.total += 1;
    if (d.stage === 'Closed Won') entry.won += 1;
    closed.set(d.rep, entry);
  }
  return Array.from(closed.entries())
    .map(([rep, { won, total }]) => ({
      rep,
      won,
      total,
      winRate: total > 0 ? won / total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

function WinRateTable({ deals }) {
  const rows = winRateByRep(deals);
  return (
    <Card>
      <div className="text-sm font-medium text-gray-700">Win rate by rep</div>
      {rows.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">No closed deals yet.</div>
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
            {rows.map((r) => (
              <TableRow key={r.rep}>
                <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                <TableCell className="text-right tabular-nums">{r.total}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {(r.winRate * 100).toFixed(0)}%
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
  const deals = useDeals();
  const stages = useMemo(() => {
    const set = new Set(deals.map((d) => d.stage));
    return Array.from(set).sort();
  }, [deals]);
  const [stage, setStage] = useState('all');

  const filtered = useMemo(() => {
    if (stage === 'all') return deals;
    return deals.filter((d) => d.stage === stage);
  }, [deals, stage]);

  const chartData = useMemo(() => byRegion(filtered), [filtered]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Deal amount by region</h1>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="region" className="mt-6">
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <div className="mt-6">
            <RegionChart data={chartData} />
          </div>
        </TabsContent>
        <TabsContent value="win-rate">
          <div className="mt-6">
            <WinRateTable deals={deals} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
