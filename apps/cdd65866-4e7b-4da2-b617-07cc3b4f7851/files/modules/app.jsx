import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Skeleton, Button, Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { currency, compactCurrency } from './lib/format.js';
import { FilterBar } from './components/filter-bar.jsx';
import { WinRateTable } from './components/win-rate-by-rep.jsx';

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.stage));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (stage === 'all') return rows;
    return rows.filter((r) => r.stage === stage);
  }, [rows, stage]);

  const byRegion = useMemo(() => {
    const totals = {};
    for (const r of filtered) {
      totals[r.region] = (totals[r.region] || 0) + Number(r.amount);
    }
    return Object.entries(totals)
      .map(([region, amount]) => ({ region, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const total = useMemo(() => filtered.reduce((sum, r) => sum + Number(r.amount), 0), [filtered]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">Total deal amount by region, filterable by stage.</p>
        </div>
        {!loading && !error ? (
          <FilterBar stages={stages} stage={stage} onStageChange={setStage} onReset={() => setStage('all')} />
        ) : null}
      </div>

      {loading ? (
        <div role="status" aria-label="Loading deals" className="mt-6">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <p className="text-sm text-gray-700">Deals could not be loaded.</p>
          <Button className="mt-2" onClick={retry}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-500">No deals match this filter.</p>
          <Button className="mt-3" variant="light" onClick={() => setStage('all')}>Reset filters</Button>
        </Card>
      ) : (
        <Tabs defaultValue="by-region" className="mt-6">
          <TabsList>
            <TabsTrigger value="by-region">Amount by region</TabsTrigger>
            <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="by-region">
            <div className="ana-figure ana-brackets mt-6">
              <span className="ana-figure__label">total amount{stage !== 'all' ? ` \u00b7 ${stage}` : ''}</span>
              <div className="ana-figure__value">{compactCurrency(total)}</div>
              <span className="ana-figure__note">{filtered.length} deals</span>
            </div>
            <Card className="mt-6">
              <BarChart
                data={byRegion}
                index="region"
                categories={['amount']}
                valueFormatter={currency}
                className="mt-4 h-72"
                yAxisWidth={70}
              />
            </Card>
          </TabsContent>
          <TabsContent value="win-rate">
            <Card className="mt-6">
              <WinRateTable rows={rows} />
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
