import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Callout, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from 'tremor';
import { useSource } from './hooks/use-source.js';
import { amountByRegion, uniqueStages } from './lib/shape.js';
import { winRateByRep } from './lib/win-rate.js';
import { RegionChart } from './components/region-chart.jsx';
import { StageFilter } from './components/stage-filter.jsx';
import { WinRateTable } from './components/win-rate-table.jsx';

function App() {
  const { rows, loading, error, retry } = useSource('deals');
  const [stage, setStage] = useState('all');

  const stages = useMemo(() => uniqueStages(rows), [rows]);
  const filteredRows = useMemo(
    () => (stage === 'all' ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );
  const chartData = useMemo(() => amountByRegion(filteredRows), [filteredRows]);
  const winRateData = useMemo(() => winRateByRep(rows), [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Deals by region</h1>
          <p className="text-sm text-gray-500">
            Filter 200 synthetic deals by stage to see total amount by region.
          </p>
        </div>
        {!loading && !error ? <StageFilter stages={stages} value={stage} onValueChange={setStage} /> : null}
      </div>
      <div className="mt-6">
        {loading ? (
          <div role="status" aria-label="Loading deals">
            <Skeleton className="h-80 w-full" />
          </div>
        ) : error ? (
          <Callout title="Deals could not be loaded" variant="error">
            {String(error)}
            <div className="mt-3">
              <Button onClick={retry}>Retry</Button>
            </div>
          </Callout>
        ) : (
          <Tabs defaultValue="region">
            <TabsList>
              <TabsTrigger value="region">By region</TabsTrigger>
              <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
            </TabsList>
            <TabsContent value="region">
              {chartData.length === 0 ? (
                <Callout title="No deals match this filter">Try a different stage.</Callout>
              ) : (
                <RegionChart data={chartData} />
              )}
            </TabsContent>
            <TabsContent value="reps">
              <WinRateTable data={winRateData} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
