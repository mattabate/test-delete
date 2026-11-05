import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';
import { currency } from './lib/format.js';

const ALL_STAGES = 'all'; // stage filter sentinel

function aggregateByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    const prev = totals.get(r.region) || 0;
    totals.set(r.region, prev + Number(r.amount));
  }
  return Array.from(totals.entries()).map(([region, amount]) => ({ region, amount }));
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

  const byRegion = useMemo(() => aggregateByRegion(filtered), [filtered]);
  const total = useMemo(() => filtered.reduce((sum, r) => sum + Number(r.amount), 0), [filtered]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales pipeline</div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        <div>
          <div className="text-lg font-semibold text-gray-900">Deals by region</div>
          <div className="text-sm text-gray-500">200 synthetic deals, filterable by stage</div>
        </div>
        <div className="w-44">
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
      </div>

      {refreshing ? <p role="status" className="text-sm text-gray-500 mt-4">Updating...</p> : null}

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>Retry</Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-500">No deals match this stage.</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="ana-figure">
            <span className="ana-figure__label">total amount · selected stage</span>
            <div className="ana-figure__value">{currency(total)}</div>
            <span className="ana-figure__note">{filtered.length} deals</span>
          </div>
          <Tabs defaultValue="by-region">
            <TabsList>
              <TabsTrigger value="by-region">By region</TabsTrigger>
              <TabsTrigger value="by-rep">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="by-region">
              <RegionChart rows={byRegion} />
            </TabsContent>
            <TabsContent value="by-rep">
              <WinRateTable rows={filtered} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
