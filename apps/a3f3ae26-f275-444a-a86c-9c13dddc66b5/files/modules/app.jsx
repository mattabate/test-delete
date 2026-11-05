import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { currency } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

const ALL_STAGES = 'All stages';

function FilterBar({ stage, setStage, stages }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Filter by stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STAGES}>{ALL_STAGES}</SelectItem>
          {stages.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {stage !== ALL_STAGES ? (
        <Button variant="light" onClick={() => setStage(ALL_STAGES)}>Reset</Button>
      ) : null}
    </div>
  );
}

function RegionChart({ rows }) {
  const data = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort((a, b) => b.amount - a.amount);
  }, [rows]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.amount, 0), [data]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Total amount by region</div>
      <div className="mt-2 font-mono text-2xl tabular-nums text-gray-900">{currency(total)}</div>
      {data.length === 0 ? (
        <div className="mt-6 h-48 flex items-center justify-center text-sm text-gray-500">No deals match this filter.</div>
      ) : (
        <BarChart
          data={data}
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

function WinRateTable({ rows }) {
  const data = useMemo(() => {
    const byRep = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = byRep.get(r.rep) || { won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      byRep.set(r.rep, entry);
    }
    return Array.from(byRep, ([rep, { won, closed }]) => ({
      rep,
      winRate: closed > 0 ? (won / closed) * 100 : 0,
      closed,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Win rate by rep</div>
      {data.length === 0 ? (
        <div className="mt-6 h-24 flex items-center justify-center text-sm text-gray-500">No closed deals for this filter.</div>
      ) : (
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
              <TableHead className="text-right">Closed deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.rep}>
                <TableCell className="font-medium text-gray-900">{d.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{d.winRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right tabular-nums">{d.closed}</TableCell>
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
      <h1 className="text-lg font-semibold text-gray-900 mt-1">Deals by region</h1>
      <p className="text-sm text-gray-500">Synthetic dataset of 200 sales deals; filter by stage to see region totals shift.</p>
      {refreshing ? <p role="status" className="text-sm text-gray-500 mt-2">Updating...</p> : null}
      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading deals"><Skeleton className="h-10 w-56" /></div>
        ) : error ? (
          <div role="alert" className="text-sm text-gray-700">
            <p>Deals could not be loaded.</p>
            <Button onClick={retry}>Retry</Button>
          </div>
        ) : (
          <FilterBar stage={stage} setStage={setStage} stages={stages} />
        )}
      </div>
      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading chart"><Skeleton className="h-80 w-full" /></div>
        ) : error ? null : (
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">By region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <div className="mt-6">
                <RegionChart rows={filtered} />
              </div>
            </TabsContent>
            <TabsContent value="reps">
              <div className="mt-6">
                <WinRateTable rows={filtered} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
