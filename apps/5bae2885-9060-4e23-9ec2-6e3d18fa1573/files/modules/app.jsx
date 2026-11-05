import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Callout, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from 'tremor';
import { usd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

function FilterBar({ stage, setStage, stages }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
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
  );
}

function RegionChart({ data }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">amount by region</div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={usd}
        className="mt-6 h-80"
      />
    </Card>
  );
}

const percent = (v) => (v * 100).toFixed(1) + '%';

function WinRateTable({ data }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">win rate by rep</div>
      <Table className="mt-6">
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
              <TableCell className="text-right tabular-nums">{percent(r.winRate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.stage))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'all' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const winRateByRep = useMemo(() => {
    if (!rows) return [];
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = totals.get(r.rep) || { closed: 0, won: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals, ([rep, { closed, won }]) => ({
      rep,
      closed,
      winRate: closed > 0 ? won / closed : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <h1 className="mt-1 text-lg font-semibold text-gray-900">Deal amount by region</h1>
      <p className="mt-1 text-sm text-gray-500">Filter the 200 synthetic deals by stage to see how total amount shifts across regions.</p>

      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="mt-6 h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <Callout title="Deals could not be loaded" variant="error">
            {String(error.message || error)}
          </Callout>
          <Button className="mt-3" onClick={retry}>Retry</Button>
        </div>
      ) : (
        <Tabs defaultValue="region" className="mt-6">
          <TabsList>
            <TabsTrigger value="region">Amount by region</TabsTrigger>
            <TabsTrigger value="winrate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <div className="mt-6 space-y-6">
              <FilterBar stage={stage} setStage={setStage} stages={stages} />
              {byRegion.length === 0 ? (
                <Card>
                  <p className="text-sm text-gray-500">No deals match this stage.</p>
                </Card>
              ) : (
                <RegionChart data={byRegion} />
              )}
            </div>
          </TabsContent>
          <TabsContent value="winrate">
            <div className="mt-6">
              <WinRateTable data={winRateByRep} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
