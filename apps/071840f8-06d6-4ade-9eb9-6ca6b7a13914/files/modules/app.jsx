import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { WinRateTable } from './components/winrate-rep-table.jsx';
import { currency } from './lib/format.js';

const ALL_STAGES = 'all';

function App() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState(ALL_STAGES);

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(
    () => (stage === ALL_STAGES ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals.entries())
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, r) => sum + Number(r.amount), 0),
    [filtered],
  );

  const winRateByRep = useMemo(() => {
    const closed = rows.filter((r) => r.stage === 'Won' || r.stage === 'Lost');
    const byRep = new Map();
    for (const r of closed) {
      const entry = byRep.get(r.rep) || { rep: r.rep, won: 0, lost: 0 };
      if (r.stage === 'Won') entry.won += 1;
      else entry.lost += 1;
      byRep.set(r.rep, entry);
    }
    return Array.from(byRep.values())
      .map((e) => ({ ...e, winRatePct: Math.round((e.won / (e.won + e.lost)) * 1000) / 10 }))
      .sort((a, b) => b.winRatePct - a.winRatePct);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales pipeline</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-900">Deals by region</div>
          <div className="text-sm text-gray-500">200 synthetic sales deals, filterable by stage</div>
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STAGES}>All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>Retry</Button>
        </Card>
      ) : (
        <>
          {refreshing ? <p role="status" className="mt-4 text-sm text-gray-500">Updating...</p> : null}
          <Tabs defaultValue="region" className="mt-6">
            <TabsList>
              <TabsTrigger value="region">By region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              {filtered.length === 0 ? (
                <Card className="mt-6">
                  <p className="text-sm text-gray-500">No deals match this stage.</p>
                </Card>
              ) : (
                <>
                  <div className="ana-figure ana-brackets mt-6">
                    <span className="ana-figure__label">total amount · {stage === ALL_STAGES ? 'all stages' : stage}</span>
                    <div className="ana-figure__value">{currency(totalAmount)}</div>
                  </div>
                  <div className="mt-6">
                    <RegionChart rows={byRegion} />
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="reps">
              <div className="mt-6">
                {winRateByRep.length === 0 ? (
                  <Card>
                    <p className="text-sm text-gray-500">No closed deals yet.</p>
                  </Card>
                ) : (
                  <WinRateTable rows={winRateByRep} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
