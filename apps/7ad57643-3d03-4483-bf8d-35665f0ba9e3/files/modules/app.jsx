import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { StageFilter } from './components/stage-filter.jsx';
import { ProbePanel } from './components/probe-panel.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';

function rollupByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
  }
  return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}

function rollupWinRateByRep(rows) {
  const byRep = new Map();
  for (const r of rows) {
    if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
    const entry = byRep.get(r.rep) || { closed: 0, won: 0 };
    entry.closed += 1;
    if (r.stage === 'Closed Won') entry.won += 1;
    byRep.set(r.rep, entry);
  }
  return Array.from(byRep, ([rep, { closed, won }]) => ({
    rep,
    closed,
    winRate: closed > 0 ? won / closed : 0,
  })).sort((a, b) => b.winRate - a.winRate);
}

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.stage))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'all' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const chartRows = useMemo(() => rollupByRegion(filtered), [filtered]);
  const winRateRows = useMemo(() => rollupWinRateByRep(rows || []), [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <div className="ana-kicker">rc9 probe lemur</div>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">Deal amount by region</h1>
        <p className="text-sm text-gray-500">
          Synthetic sales deals, filterable by stage. Snapshot as of last refresh.
        </p>
      </div>

      {refreshing ? <p role="status" className="text-sm text-gray-500">Updating...</p> : null}

      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="text-sm text-gray-500">No deals available.</p>
      ) : (
        <Tabs defaultValue="by-region">
          <TabsList>
            <TabsTrigger value="by-region">Amount by region</TabsTrigger>
            <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="by-region">
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <StageFilter stages={stages} value={stage} onChange={setStage} />
              </div>
              <RegionChart rows={chartRows} />
            </div>
          </TabsContent>
          <TabsContent value="win-rate">
            <div className="mt-6">
              <WinRateTable rows={winRateRows} />
            </div>
          </TabsContent>
        </Tabs>
      )}

      <ProbePanel />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
