import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { group, sum } from 'd3-array';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { FilterBar } from './components/filter-bar.jsx';
import { RegionChart } from './components/region-chart.jsx';
import { ProbePanel } from './components/probe-panel.jsx';
import {
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'tremor';

const percent = (v) =>
  Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : '--';

function WinRateTable({ rows, loading, error, retry }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        win rate by rep
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Won / (Won + Lost) across closed deals.
      </div>
      {loading ? (
        <div role="status" aria-label="Loading win rate">
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 flex h-72 flex-col items-center justify-center gap-3 text-sm text-gray-500">
          <p>This table could not load.</p>
          <button className="font-mono text-xs underline" onClick={retry}>
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex h-72 items-center justify-center text-sm text-gray-500">
          No closed deals to compute win rate from.
        </div>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Won</TableHead>
              <TableHead className="text-right">Lost</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.rep}>
                <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                <TableCell className="text-right tabular-nums">{r.lost}</TableCell>
                <TableCell className="text-right tabular-nums">{percent(r.winRate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

const STAGES = ['Prospecting', 'Negotiation', 'Won', 'Lost'];

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All');

  const filtered = useMemo(
    () => (stage === 'All' ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );

  const byRegion = useMemo(() => {
    const grouped = group(filtered, (r) => r.region);
    return Array.from(grouped, ([region, items]) => ({
      region,
      amount: sum(items, (r) => Number(r.amount) || 0),
    })).sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const winRateByRep = useMemo(() => {
    const closed = rows.filter((r) => r.stage === 'Won' || r.stage === 'Lost');
    const grouped = group(closed, (r) => r.rep);
    return Array.from(grouped, ([rep, items]) => {
      const won = items.filter((r) => r.stage === 'Won').length;
      const lost = items.filter((r) => r.stage === 'Lost').length;
      const total = won + lost;
      return { rep, won, lost, winRate: total > 0 ? won / total : NaN };
    }).sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Sales deals explorer</h1>
      <p className="text-sm text-gray-500">
        200 synthetic deals across region, rep, stage, amount, and close month.
      </p>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="mt-6">
            <FilterBar stage={stage} onStageChange={setStage} stages={STAGES} />
          </div>
          <div className="mt-6 space-y-8">
            <RegionChart rows={byRegion} loading={loading} error={error} retry={retry} stage={stage} />
            <ProbePanel />
          </div>
        </TabsContent>
        <TabsContent value="reps">
          <div className="mt-6">
            <WinRateTable rows={winRateByRep} loading={loading} error={error} retry={retry} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
