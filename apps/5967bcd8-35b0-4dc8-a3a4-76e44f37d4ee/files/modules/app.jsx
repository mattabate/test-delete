import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Card,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  BarChart,
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

function useDeals() {
  return ana.data.get('deals');
}

const currency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);

function aggregateByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
  }
  return Array.from(totals.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

const percent = (v) => (v * 100).toFixed(1) + '%';

function winRateByRep(rows) {
  const byRep = new Map();
  for (const r of rows) {
    if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
    const entry = byRep.get(r.rep) || { won: 0, closed: 0 };
    entry.closed += 1;
    if (r.stage === 'Closed Won') entry.won += 1;
    byRep.set(r.rep, entry);
  }
  return Array.from(byRep.entries())
    .map(([rep, { won, closed }]) => ({ rep, won, closed, winRate: closed > 0 ? won / closed : 0 }))
    .sort((a, b) => b.winRate - a.winRate);
}

function App() {
  const deals = useDeals();
  const stages = useMemo(() => {
    const s = new Set(deals.map((d) => d.stage));
    return Array.from(s).sort();
  }, [deals]);
  const [stage, setStage] = useState('all');

  const filtered = useMemo(() => {
    if (stage === 'all') return deals;
    return deals.filter((d) => d.stage === stage);
  }, [deals, stage]);

  const chartData = useMemo(() => aggregateByRegion(filtered), [filtered]);
  const winRateData = useMemo(() => winRateByRep(deals), [deals]);
  const [tab, setTab] = useState('region');

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Pipeline overview</h1>
          <p className="text-sm text-gray-500">Filter by stage to see how totals shift across the pipeline.</p>
        </div>
        {tab === 'region' ? (
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <Card className="mt-6">
            <div className="text-sm font-medium text-gray-900">Total amount by region</div>
            <div className="text-xs text-gray-500 mt-1">{filtered.length} deals in view</div>
            <BarChart
              data={chartData}
              index="region"
              categories={['amount']}
              valueFormatter={currency}
              colors={['accent']}
              yAxisWidth={70}
              className="mt-6 h-72"
            />
          </Card>
        </TabsContent>
        <TabsContent value="reps">
          <Card className="mt-6">
            <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
            <div className="text-xs text-gray-500 mt-1">Closed Won vs. Closed Won + Closed Lost deals</div>
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
                {winRateData.map((r) => (
                  <TableRow key={r.rep}>
                    <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
                    <TableCell className="text-right tabular-nums">{percent(r.winRate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
