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
  Badge,
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

const rows = ana.data.get('deals') ?? [];

const currency = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

const STAGES = ['Won', 'Lost', 'Open'];

function aggregateByRegion(data) {
  const totals = new Map();
  for (const r of data) {
    const region = r.region ?? 'Unknown';
    const amt = Number(r.amount) || 0;
    totals.set(region, (totals.get(region) || 0) + amt);
  }
  return Array.from(totals.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

const percent = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(v);

function winRateByRep(data) {
  const counts = new Map();
  for (const r of data) {
    const rep = r.rep ?? 'Unknown';
    if (!counts.has(rep)) counts.set(rep, { won: 0, total: 0 });
    const entry = counts.get(rep);
    entry.total += 1;
    if (r.stage === 'Won') entry.won += 1;
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

function WinRateTable({ data }) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-500">
        No deals available
      </div>
    );
  }
  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Rep</TableHead>
          <TableHead className="text-right">Won</TableHead>
          <TableHead className="text-right">Total deals</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => (
          <TableRow key={r.rep}>
            <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{r.won}</TableCell>
            <TableCell className="text-right tabular-nums">{r.total}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {percent(r.winRate)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FilterBar({ stage, setStage }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
          Stage
        </div>
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
      {stage !== 'all' ? (
        <Button variant="light" onClick={() => setStage('all')}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}

function RegionChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-gray-500">
        No deals match this filter
      </div>
    );
  }
  return (
    <BarChart
      data={data}
      index="region"
      categories={['amount']}
      valueFormatter={currency}
      colors={['accent']}
      className="mt-6 h-60"
      yAxisWidth={70}
    />
  );
}

function ProbePanel() {
  const [seconds, setSeconds] = useState(2);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!ana.compute.available) return;
    setStatus('running');
    setError(null);
    setResult(null);
    try {
      const res = await ana.compute.run('slow_probe', { seconds: Number(seconds) });
      setResult(res);
      setStatus('done');
    } catch (e) {
      setError(e.message || 'Request failed');
      setStatus('error');
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Server probe</div>
        {status === 'running' ? (
          <span className="ana-tag ana-tag--computing">
            <span className="ana-tag__dot" />computing
          </span>
        ) : null}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Calls the slow_probe compute function, which sleeps server-side before replying.
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
            Seconds
          </div>
          <input
            type="number"
            min="0"
            max="30"
            step="1"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-24 border border-gray-300 px-2 py-1.5 text-sm font-mono"
          />
        </div>
        <Button
          onClick={run}
          disabled={!ana.compute.available || status === 'running'}
        >
          {status === 'running' ? 'Running...' : 'Run probe'}
        </Button>
        {!ana.compute.available ? (
          <span className="text-xs text-gray-500">
            Compute is unavailable in this context (e.g. share link).
          </span>
        ) : null}
      </div>
      {result ? (
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="success">slept {result.slept}s</Badge>
          <span className="ana-tag ana-tag--live">
            <span className="ana-tag__dot" />live
          </span>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      ) : null}
    </Card>
  );
}

function App() {
  const [stage, setStage] = useState('all');

  const filtered = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [stage]);

  const chartData = useMemo(() => aggregateByRegion(filtered), [filtered]);
  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + d.amount, 0),
    [chartData]
  );
  const winRateData = useMemo(() => winRateByRep(rows), []);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">rc6 probe lemur</div>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">
          Sales deals by region
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Filter 200 synthetic deals by stage and see where total amount concentrates.
        </p>
      </div>

      <Card>
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">By region</TabsTrigger>
            <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <FilterBar stage={stage} setStage={setStage} />
            <div className="mt-6">
              <div className="text-sm text-gray-500">Total amount in view</div>
              <div className="text-2xl font-semibold font-mono tabular-nums text-gray-900">
                {currency(total)}
              </div>
              <RegionChart data={chartData} />
            </div>
          </TabsContent>
          <TabsContent value="reps">
            <p className="text-sm text-gray-500 mt-4">
              Share of each rep's deals that closed Won, across all stages.
            </p>
            <WinRateTable data={winRateData} />
          </TabsContent>
        </Tabs>
      </Card>

      <ProbePanel />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
