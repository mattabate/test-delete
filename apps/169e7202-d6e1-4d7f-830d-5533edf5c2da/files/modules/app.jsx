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

const STAGES = ['Prospecting', 'Negotiation', 'Won', 'Lost'];

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
        filter by stage
      </span>
      <Select value={stage} onValueChange={setStage}>
        <SelectTrigger className="w-44">
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
  );
}

function RegionChart({ rows }) {
  const data = useMemo(() => {
    const totals = new Map();
    for (const row of rows) {
      totals.set(row.region, (totals.get(row.region) || 0) + Number(row.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        total amount by region
      </div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {usd(data.reduce((sum, d) => sum + d.amount, 0))}
      </div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={usd}
        className="mt-6 h-72"
      />
    </Card>
  );
}

function WinRateTable({ rows }) {
  const data = useMemo(() => {
    const byRep = new Map();
    for (const row of rows) {
      if (row.stage !== 'Won' && row.stage !== 'Lost') continue;
      const entry = byRep.get(row.rep) || { won: 0, closed: 0 };
      entry.closed += 1;
      if (row.stage === 'Won') entry.won += 1;
      byRep.set(row.rep, entry);
    }
    return Array.from(byRep, ([rep, { won, closed }]) => ({
      rep,
      winRate: closed ? won / closed : 0,
    })).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        win rate by rep
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.rep}>
              <TableCell className="font-medium text-gray-900">{d.rep}</TableCell>
              <TableCell className="text-right tabular-nums">
                {(d.winRate * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const filteredRows = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">sales deals explorer</div>
        <h1 className="text-lg font-semibold text-gray-900">
          Deal amounts by region
        </h1>
        <p className="text-sm text-gray-500">
          Synthetic dataset of 200 sales deals, filterable by stage.
        </p>
      </div>
      {refreshing ? (
        <p role="status" className="text-sm text-gray-500">
          Updating
        </p>
      ) : null}
      <FilterBar stage={stage} setStage={setStage} />
      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <button className="text-sm underline" onClick={retry}>
            Retry
          </button>
        </div>
      ) : filteredRows.length === 0 ? (
        <p className="text-sm text-gray-500">No deals match this filter.</p>
      ) : (
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">Amount by region</TabsTrigger>
            <TabsTrigger value="winrate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <RegionChart rows={filteredRows} />
          </TabsContent>
          <TabsContent value="winrate">
            <WinRateTable rows={filteredRows} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
