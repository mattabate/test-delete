import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger, TabsContent, Card } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';

const STAGES = ['All stages', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All stages');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return stage === 'All stages' ? rows : rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">Total deal amount by region, filterable by stage.</p>
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-6">
        <Tabs defaultValue="by-region">
          <TabsList>
            <TabsTrigger value="by-region">Amount by region</TabsTrigger>
            <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="by-region">
            <div className="mt-6">
              <RegionChart rows={byRegion} loading={loading} error={error} retry={retry} />
            </div>
          </TabsContent>
          <TabsContent value="win-rate">
            <Card className="mt-6">
              <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
                win rate by rep
              </div>
              <div className="mt-4">
                <WinRateTable rows={rows || []} loading={loading} error={error} retry={retry} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
