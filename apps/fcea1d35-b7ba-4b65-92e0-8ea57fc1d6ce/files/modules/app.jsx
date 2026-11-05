import { useMemo, useState, Component } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Callout,
  Button,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from 'tremor';
import { useSource } from './hooks/use-source.js';
import { RegionChart } from './components/region-chart.jsx';
import { StageFilter } from './components/stage-filter.jsx';
import { currency } from './lib/format.js';

class Section extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <Callout title="This section could not load">
        {String(this.state.error.message || this.state.error)}
      </Callout>
    ) : (
      this.props.children
    );
  }
}

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
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [filtered]);

  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + Number(r.amount), 0),
    [filtered],
  );

  const winRateByRep = useMemo(() => {
    const totals = new Map();
    for (const r of rows) {
      if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
      const entry = totals.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
      entry.closed += 1;
      if (r.stage === 'Closed Won') entry.won += 1;
      totals.set(r.rep, entry);
    }
    return Array.from(totals.values())
      .map((e) => ({ ...e, winRate: e.closed ? (e.won / e.closed) * 100 : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals explorer</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Amount by region</h1>
          <p className="text-sm text-gray-500">200 synthetic deals, filterable by stage</p>
        </div>
        {!loading && !error ? (
          <StageFilter stages={stages} value={stage} onChange={setStage} />
        ) : null}
      </div>

      <div className="mt-8">
        <Tabs defaultValue="region">
          <TabsList>
            <TabsTrigger value="region">By region</TabsTrigger>
            <TabsTrigger value="reps">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="region">
            <Section>
              {loading ? (
                <div role="status" aria-label="Loading deals">
                  <Skeleton className="h-72 w-full" />
                </div>
              ) : error ? (
                <div role="alert">
                  <Callout title="Deals could not be loaded">
                    {String(error.message || error)}
                  </Callout>
                  <Button className="mt-3" onClick={retry}>
                    Retry
                  </Button>
                </div>
              ) : byRegion.length === 0 ? (
                <Callout title="No deals match this filter">
                  Try a different stage.
                </Callout>
              ) : (
                <>
                  <div className="ana-figure">
                    <span className="ana-figure__label">total amount (filtered)</span>
                    <div className="ana-figure__value">{currency(total)}</div>
                    <span className="ana-figure__note">{filtered.length} deals</span>
                  </div>
                  <div className="mt-6">
                    <RegionChart data={byRegion} />
                  </div>
                </>
              )}
            </Section>
          </TabsContent>
          <TabsContent value="reps">
            <Section>
              {loading ? (
                <div role="status" aria-label="Loading deals">
                  <Skeleton className="h-72 w-full" />
                </div>
              ) : error ? (
                <div role="alert">
                  <Callout title="Deals could not be loaded">
                    {String(error.message || error)}
                  </Callout>
                  <Button className="mt-3" onClick={retry}>
                    Retry
                  </Button>
                </div>
              ) : winRateByRep.length === 0 ? (
                <Callout title="No closed deals yet">
                  Win rate needs at least one Closed Won or Closed Lost deal.
                </Callout>
              ) : (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rep</TableHead>
                      <TableHead className="text-right">Closed deals</TableHead>
                      <TableHead className="text-right">Won</TableHead>
                      <TableHead className="text-right">Win rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winRateByRep.map((r) => (
                      <TableRow key={r.rep}>
                        <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.winRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
