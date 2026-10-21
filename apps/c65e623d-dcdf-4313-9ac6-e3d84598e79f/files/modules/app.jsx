import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'tremor';
import { amountByRegion, stageOptions, winRateByRep } from './lib/rollup.js';
import { StageFilter } from './components/stage-filter.jsx';
import { RegionBarCard } from './components/region-bar-card.jsx';
import { WinRateCard } from './components/win-rate-card.jsx';
import { useDeals } from './hooks/use-deals.js';
// marker

function App() {
  // test
  const deals = useDeals();
  const stages = useMemo(() => stageOptions(deals), [deals]);
  const [stage, setStage] = useState('all');
  const [tab, setTab] = useState('region');

  const filtered = useMemo(() => {
    if (stage === 'all') return deals;
    return deals.filter((d) => d.stage === stage);
  }, [deals, stage]);

  const regionData = useMemo(() => amountByRegion(filtered), [filtered]);
  const repWinRates = useMemo(() => winRateByRep(deals), [deals]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">rc9 probe lemur</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900">
          Sales deals
        </h1>
        {tab === 'region' ? (
          <StageFilter stage={stage} stages={stages} onChange={setStage} />
        ) : null}
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="region">Amount by region</TabsTrigger>
          <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          <div className="mt-2">
            <RegionBarCard data={regionData} />
          </div>
        </TabsContent>
        <TabsContent value="reps">
          <div className="mt-2">
            <WinRateCard data={repWinRates} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
