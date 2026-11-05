import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { RepWinRateTable } from './components/rep-win-rate-table.jsx';
import { currency } from './lib/format.js';

const ALL_STAGES = 'All stages';

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState(ALL_STAGES);

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return [ALL_STAGES, ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(
    () => (stage === ALL_STAGES ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const total = useMemo(() => filtered.reduce((sum, r) => sum + r.amount, 0), [filtered]);

  const winRateByRep = useMemo(() => {
    const closedByRep = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = closedByRep.get(r.rep) || { rep: r.rep, closed: 0, won: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      closedByRep.set(r.rep, entry);
    }
    return Array.from(closedByRep.values())
      .map((e) => ({ rep: e.rep, closed: e.closed, winRate: e.closed ? e.won / e.closed : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">200 synthetic deals, filterable by stage.</p>
        </div>
        <div className="w-48">
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger>
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {refreshing ? (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Updating...
        </p>
      ) : null}

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>
            Retry
          </Button>
        </Card>
      ) : byRegion.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-500">No deals match this stage.</p>
        </Card>
      ) : (
        <>
          <div className="ana-figure ana-brackets mt-6">
            <span className="ana-figure__label">total amount · {stage}</span>
            <div className="ana-figure__value">{currency(total)}</div>
            <span className="ana-figure__note">{filtered.length} deals</span>
          </div>
          <Tabs defaultValue="region" className="mt-6">
            <TabsList>
              <TabsTrigger value="region">Amount by region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              <div className="mt-6">
                <RegionChart rows={byRegion} />
              </div>
            </TabsContent>
            <TabsContent value="reps">
              <div className="mt-6">
                <RepWinRateTable rows={winRateByRep} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
